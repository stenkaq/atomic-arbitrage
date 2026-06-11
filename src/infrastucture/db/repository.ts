import { Model } from "mongoose";

export abstract class CustomRepository<M, T> {
  constructor(protected readonly model: Model<T>) {}

  protected abstract toDomain(doc: T): M;
  protected abstract toSchema(entity: M): T;

  async findAll(): Promise<M[]> {
    const docs = await this.model.find();
    return docs.map((doc) => this.toDomain(doc as unknown as T));
  }

  async findById(id: string): Promise<M | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toDomain(doc as unknown as T) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  async save(entity: M): Promise<M> {
    const doc = await this.model.create(this.toSchema(entity));
    return this.toDomain(doc as unknown as T);
  }

  protected async upsertById(id: string, entity: M): Promise<M> {
    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: { _id: id, ...entity } },
      { upsert: true, new: true },
    );
    return this.toDomain(doc as unknown as T);
  }

  protected async upsertManyById(
    items: Array<{ id: string; entity: M }>,
  ): Promise<void> {
    const ops = items.map(({ id, entity }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: entity },
        upsert: true,
      },
    }));
    await this.model.bulkWrite(ops as any);
  }
}
