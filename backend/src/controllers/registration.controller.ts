import { Request, Response, NextFunction } from "express";
import { RegistrationService } from "../services/registration.service";
import { registrationSchema } from "../validators/schemas";
import { sendResponse } from "../utils/response";
import { admin } from "../firebase/admin";

const generateTeamId = () => `OG-${Date.now().toString(36).toUpperCase()}`;

export async function createRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registrationSchema.parse(req.body);
    const service = new RegistrationService();
    const teamId = generateTeamId();

    const registrationId = await service.apply({
      ...data,
      teamId,
      status: "pending",
    });

    sendResponse({
      res,
      statusCode: 201,
      message: "Squad registration submitted successfully",
      data: { teamId, registrationId },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRegistrations(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, limit = "50" } = req.query;
    const service = new RegistrationService();
    const list = await service.listRegistrations(
      status && typeof status === "string" ? status : undefined,
      Number(limit)
    );

    sendResponse({
      res,
      data: { registrations: list, total: list.length },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRegistrationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminUser = (req as Request & { user?: admin.auth.DecodedIdToken }).user;

    const service = new RegistrationService();
    await service.updateStatus(
      id,
      status,
      adminUser?.uid || "system",
      adminUser?.email || "system@onlygoats-ff.com"
    );

    sendResponse({
      res,
      message: `Registration status updated to ${status}`,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const adminUser = (req as Request & { user?: admin.auth.DecodedIdToken }).user;

    const service = new RegistrationService();
    await service.removeRegistration(
      id,
      adminUser?.uid || "system",
      adminUser?.email || "system@onlygoats-ff.com"
    );

    sendResponse({
      res,
      message: "Registration record deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
export default {
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
};
