import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@ObjectType()
@Entity()
export class Category extends CoreEntity {
    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string; 

    @Field(type => [Restaurant], { nullable: true })
    @OneToMany(type => Restaurant, (restaurant) => restaurant.category, {
        nullable: true,
    })
    restaurants: Restaurant[];

    @Field(type => String)
    @Column({ nullable: true })
    @IsString()
    coverImage: string;

    @Field(type => String)
    @Column()
    @IsString()
    slug: string;
}