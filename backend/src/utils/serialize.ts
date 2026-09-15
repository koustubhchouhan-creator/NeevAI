import mongoose from "mongoose";

/**
 * Convert a Mongoose document (or lean object) into a plain object,
 * exposing the Mongo `_id` as a string `id` and dropping `__v`.
 */
export function serializeDoc(doc: any): any {
  if (!doc) return doc;
  const obj =
    typeof doc.toObject === "function" ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  const result: Record<string, unknown> = { ...rest };
  if (_id !== undefined) result.id = String(_id);
  return result;
}

export function serializeDocs(docs: any[]): any[] {
  return docs.map(serializeDoc);
}

/**
 * Build a query that resolves a project by its Mongo `_id` when the supplied
 * value is a valid ObjectId, otherwise by the official `projectId`.
 */
export function buildIdQuery(id: string): Record<string, unknown> {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ _id: id }, { projectId: id }] };
  }
  return { projectId: id };
}
