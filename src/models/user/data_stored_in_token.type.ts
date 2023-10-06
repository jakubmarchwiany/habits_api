import { Types } from "mongoose";

export type DataStoredInToken = {
	userId: Types.ObjectId;
	dearId: Types.ObjectId;
};
