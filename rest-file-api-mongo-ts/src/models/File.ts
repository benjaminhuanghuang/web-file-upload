import mongoose, { Schema, Document } from "mongoose";

export interface IFile extends Document {
  filename: string;
  data: Buffer;
  createdAt: Date;
}

const FileSchema: Schema<IFile> = new Schema({
  filename: { type: String, required: true },
  data: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FileModel = mongoose.model<IFile>("File", FileSchema);
