import mongoose from "mongoose";
import Bid from "../models/bid.model.js";
import Gig from "../models/gig.model.js";

export const createBid = async (req, res) => {
    try {
        const { gigId, message, price } = req.body;

        if (!mongoose.isValidObjectId(gigId)) {
            return res.status(400).json({ message: "Invalid gigId" });
        }
        if (!message || typeof price !== "number" || price <= 0) {
            return res.status(400).json({ message: "Invalid bid data" });
        }
        const gig = await Gig.findById(gigId).select("ownerId");
        if (!gig) {
            return res.status(404).json({ message: "Gig not found" });
        }

        if (gig.ownerId.toString() === req.user.id.toString()) {
            return res
                .status(403)
                .json({ message: "You cannot bid on your own gig" });
        }
        const existingBid = await Bid.findOne({
            gigId,
            freelancerId: req.user.id,
        });
        if (existingBid) {
            return res
                .status(400)
                .json({ message: `You have already placed a bid on this project. Message: "${existingBid.message}", Bid Amount: ₹${existingBid.price}, Status: ${existingBid.status}.` });
        }
        const bid = await Bid.create({
            gigId,
            freelancerId: req.user.id,
            message,
            price,
        });

        return res.status(201).json({
            success: true,
            data: {
                id: bid._id,
                price: bid.price,
                status: bid.status,
            },
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res
                .status(400)
                .json({ message: "Already bid on this project" });
        }

        return res.status(500).json({ message: "Server error" });
    }
};




export const getBids = async (req, res) => {
    const gig = await Gig.findById(req.params.gigId);
    if (gig.ownerId.toString() !== req.user.id)
        return res.status(403).json({ message: "Forbidden" });

    res.json(await Bid.find({ gigId: gig._id }));
};

export const hireBid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bid = await Bid.findById(req.params.bidId).session(session);
        const gig = await Gig.findById(bid.gigId).session(session);

        if (gig.status === "assigned") throw new Error("Already assigned");

        gig.status = "assigned";
        await gig.save({ session });

        await Bid.updateMany(
            { gigId: gig._id },
            { status: "rejected" },
            { session }
        );

        bid.status = "hired";
        await bid.save({ session });

        await session.commitTransaction();

        const io = req.app.get("io");
        io.to(bid.freelancerId.toString()).emit("hired", {
            message: `You have been hired for ${gig.title}`,
            gigTitle: gig.title,
            gigId: gig._id
        });

        res.json({ success:true,message: "Freelancer hired" });

    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
};
