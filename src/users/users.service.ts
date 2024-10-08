import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Injectable } from "@nestjs/common";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,

        @InjectRepository(Verification) private readonly verification: Repository<Verification>,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService
    ) {}

    async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const exists = await this.users.findOne({ where: { email } });
            if (exists) {
                return { ok: false, error: "There is a user with that email already" };
            }
            const user = await this.users.save(this.users.create({ email, password, role }));
            const verification = await this.verification.save(this.verification.create({ user: user }));
            this.mailService.sendVerificationEmail(user.email, verification.code);
            return { ok: true };
        } catch (e) {
            return { ok: false, error: "Couldn't create account" };
        }
    }

    async login({ email, password }: LoginInput): Promise<LoginOutput> {
        try {
            const user = await this.users.findOne({ where: { email } });
            if (!user) {
                return {
                    ok: false,
                    error: "User not found",
                };
            }
            const passwordCorrect = await user.checkPassword(password);
            if (!passwordCorrect) {
                return {
                    ok: false,
                    error: "wrong password",
                };
            }
            const token = this.jwtService.sign(user.id);
            return {
                ok: true,
                token: token,
            };
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }

    async findById({ userId }: UserProfileInput): Promise<UserProfileOutput> {
        try {
            console.log("userId: ", userId);
            const user = await this.users.findOneOrFail({ where: { id: userId } });
            console.log("user email: ", user.email);
            return {
                ok: true,
                user,
            };
        } catch (e) {
            return {
                error: "User Not Found",
                ok: false,
            };
        }
    }

    async editProfile(userId: number, { email, password }: EditProfileInput): Promise<EditProfileOutput> {
        try {
            const user = await this.users.findOne({ where: { id: userId } });
            if (email) {
                const userWithNewEmail = await this.users.findOne({ where: { email: email } });
                if (userWithNewEmail != null) {
                    return {
                        ok: false,
                        error: "A user with that email already exists.",
                    };
                }

                user.email = email;
                user.verified = false;
                await this.verification.delete({ user: { id: userId } });
                const verification = await this.verification.save(this.verification.create({ user: user }));
                await this.mailService.sendVerificationEmail(user.email, verification.code);
            }

            if (password) {
                user.password = password;
            }

            await this.users.save(user);
            return {
                ok: true,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async verifyEmail(code: string): Promise<VerifyEmailOutput> {
        try {
            const verification = await this.verification.findOne({ where: { code }, relations: { user: true } });
            if (verification) {
                verification.user.verified = true;
                await this.users.update(verification.user.id, { verified: verification.user.verified });
                await this.verification.delete(verification.id);
                return {
                    ok: true,
                };
            }
            return {
                ok: false,
                error: "Verification not found.",
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }
}
