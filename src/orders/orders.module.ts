import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersResolver } from "./orders.resolver";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Restaurant } from "src/restaurant/entities/restaurant.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Dish } from "src/restaurant/entities/dish.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
    providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
