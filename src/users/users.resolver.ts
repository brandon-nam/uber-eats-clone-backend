import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { UseGuards } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { Role } from "src/auth/auth-role.decorator";
import { Restaurant } from "src/restaurant/entities/restaurant.entity";

@Resolver((of) => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Mutation((returns) => CreateAccountOutput)
    createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        return this.usersService.createAccount(createAccountInput);
    }

    @Query((returns) => User)
    @Role(["Any"])
    me(@AuthUser() authUser: User) {
        return authUser;
    }

    @Query((returns) => UserProfileOutput)
    @Role(["Any"])
    userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
        return this.usersService.findById(userProfileInput);
    }

    @Mutation((returns) => LoginOutput)
    async login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
        return this.usersService.login(loginInput)
    }

    @Mutation((returns) => EditProfileOutput)
    @Role(["Any"])
    editProfile(@AuthUser() authUser: User, @Args("input") editProfileInput: EditProfileInput): Promise<EditProfileOutput> {
        return this.usersService.editProfile(authUser.id, editProfileInput);
    }

    @Mutation((returns) => VerifyEmailOutput)
    verifyEmail(@Args("input") { code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
        return this.usersService.verifyEmail(code);
    }
}
