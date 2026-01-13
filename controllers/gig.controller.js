import Gig from "../models/gig.model.js";


export const getGigById = async (req, res) => {
    const gig = await Gig.findById(req.params.id)
        .select("title description budget status ownerId createdAt")
        .lean();

    if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
    }

    res.json({
        id: gig._id.toString(),
        title: gig.title,
        description: gig.description,
        budget: gig.budget,
        status: gig.status,
        ownerId: gig.ownerId.toString(),
        createdAt: gig.createdAt
    });
};


export const createGig = async (req, res) => {
    const { title, description, budget } = req.body;

    if (!title || !description || !budget)
        return res.status(400).json({ message: "All fields required" });

    if (budget <= 0)
        return res.status(400).json({ message: "Invalid budget" });

    const gig = await Gig.create({
        title,
        description,
        budget,
        ownerId: req.user.id
    });

    res.status(201).json({
        success: true,
        data:{
        id: gig._id,
        title: gig.title,
        budget: gig.budget,
        status: gig.status
        }
    });
};


export const getGigs = async (req, res) => {
    const q = req.query.q;

    const filter = {
        status: "open",
        ...(q && { title: new RegExp(q, "i") })
    };

    const gigs = await Gig.find(filter)
        .select("title description budget status createdAt ownerId")
        .lean();

    res.json(
        gigs.map(gig => ({
            id: gig._id.toString(),
            title: gig.title,
            description: gig.description,
            budget: gig.budget,
            status: gig.status,
            createdAt: gig.createdAt,
            ownerId: gig.ownerId.toString(),
        }))
    );
};
