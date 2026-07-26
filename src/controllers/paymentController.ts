import { Request, Response } from "express";
import prisma from "../config/prisma";
import stripe from "../config/stripe";
import { successResponse, errorResponse } from "../utils/response";

// CUSTOMER: Create a Stripe payment intent for a rental order
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { rentalOrderId } = req.body;
    const customerId = req.user?.id as string;

    if (!rentalOrderId) {
      return errorResponse(res, 400, "rentalOrderId is required");
    }

    const rentalOrder = await prisma.rentalOrder.findUnique({
      where: { id: rentalOrderId },
      include: { payment: true },
    });

    if (!rentalOrder) {
      return errorResponse(res, 404, "Rental order not found");
    }

    if (rentalOrder.customerId !== customerId) {
      return errorResponse(res, 403, "You do not have access to this order");
    }

    if (rentalOrder.status !== "CONFIRMED") {
      return errorResponse(res, 400, "Order must be confirmed by provider before payment");
    }

    if (rentalOrder.payment) {
      return errorResponse(res, 409, "Payment already exists for this order");
    }

    // Stripe expects amount in smallest currency unit (cents/poisha)
    const amountInCents = Math.round(rentalOrder.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: "usd",
  payment_method_types: ["card"],
  metadata: {
    rentalOrderId: rentalOrder.id,
    customerId,
  },
});

    const payment = await prisma.payment.create({
      data: {
        transactionId: paymentIntent.id,
        rentalOrderId: rentalOrder.id,
        amount: rentalOrder.totalAmount,
        method: "card",
        provider: "Stripe",
        status: "PENDING",
      },
    });

    return successResponse(res, 201, "Payment intent created successfully", {
      clientSecret: paymentIntent.client_secret,
      payment,
    });
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// Confirm/verify payment status (called after frontend/Postman confirms payment on Stripe side)
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return errorResponse(res, 400, "transactionId is required");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    const payment = await prisma.payment.findUnique({
      where: { transactionId },
    });

    if (!payment) {
      return errorResponse(res, 404, "Payment record not found");
    }

    if (paymentIntent.status === "succeeded") {
      const updatedPayment = await prisma.payment.update({
        where: { transactionId },
        data: { status: "COMPLETED", paidAt: new Date() },
      });

      await prisma.rentalOrder.update({
        where: { id: payment.rentalOrderId },
        data: { status: "PAID" },
      });

      return successResponse(res, 200, "Payment confirmed successfully", updatedPayment);
    } else {
      const updatedPayment = await prisma.payment.update({
        where: { transactionId },
        data: { status: "FAILED" },
      });

      return errorResponse(res, 400, "Payment not completed", updatedPayment);
    }
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// Get logged-in customer's payment history
export const getMyPayments = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id as string;

    const payments = await prisma.payment.findMany({
      where: {
        rentalOrder: { customerId },
      },
      include: { rentalOrder: true },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, 200, "Payment history fetched successfully", payments);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// Get single payment details
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.id as string;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { rentalOrder: true },
    });

    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    if (payment.rentalOrder.customerId !== customerId) {
      return errorResponse(res, 403, "You do not have access to this payment");
    }

    return successResponse(res, 200, "Payment fetched successfully", payment);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};