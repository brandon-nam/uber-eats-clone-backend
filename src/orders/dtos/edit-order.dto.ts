import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Order } from "../entities/order.entity";

@InputType()
export class EditOrderInput extends PickType(Order, ["id", "orderStatus"], InputType) {}

@ObjectType()
export class EditOrderOutput extends CoreOutput {}
