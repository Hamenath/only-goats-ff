import { getDb } from "../firebase/admin";
import { admin } from "../firebase/admin";

export abstract class BaseRepository<T extends { id?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get db() {
    return getDb();
  }

  protected get collection() {
    return this.db.collection(this.collectionName);
  }

  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  async create(data: Omit<T, "id"> & { id?: string }): Promise<string> {
    if (data.id) {
      await this.collection.doc(data.id).set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return data.id;
    }
    const docRef = await this.collection.add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  async list(limit = 100, startAfterDoc?: admin.firestore.QueryDocumentSnapshot): Promise<T[]> {
    let query = this.collection.limit(limit);
    if (startAfterDoc) {
      query = query.startAfter(startAfterDoc);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }
}
