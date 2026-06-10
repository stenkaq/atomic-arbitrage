import { Model } from "mongoose";

export abstract class CustomRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find() as unknown as Promise<T[]>;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id) as unknown as Promise<T | null>;
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  protected async upsertById(id: string, data: Partial<T>): Promise<void> {
    await this.model.findByIdAndUpdate(
      id,
      { $set: { _id: id, ...data } } as any,
      { upsert: true, new: true },
    );
  }

  protected async upsertManyById(
    items: Array<{ id: string; data: Partial<T> }>,
  ): Promise<void> {
    const ops = items.map(({ id, data }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: data },
        upsert: true,
      },
    }));
    await this.model.bulkWrite(ops as any);
  }
}
