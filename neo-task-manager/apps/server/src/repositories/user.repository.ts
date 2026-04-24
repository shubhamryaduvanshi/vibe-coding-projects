import { UserModel } from "../models/user.model.js";

export class UserRepository {
  findByEmail(email: string) {
    return UserModel.findOne({ email });
  }

  findById(id: string) {
    return UserModel.findById(id);
  }

  create(data: { name: string; email: string; passwordHash: string }) {
    return UserModel.create(data);
  }

  listAll() {
    return UserModel.find().sort({ name: 1 });
  }

  async incrementRefreshTokenVersion(userId: string) {
    await UserModel.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
  }
}

