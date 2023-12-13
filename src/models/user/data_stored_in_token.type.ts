import { Types } from "mongoose";

export type DataStoredInToken = {
	dearId: Types.ObjectId;
	userId: Types.ObjectId;
};
