
import Lead from "../models/Lead.js";
import analyzeLeadWithAI from "../services/n8nService.js";

// CREATE LEAD

export const createLead = async (req, res) => {
  try {
    // 1. Save lead in MongoDB
    let lead = await Lead.create(req.body);

    // 2. Send lead to n8n for AI analysis
    const aiAnalysis = await analyzeLeadWithAI(lead.toObject());

    // 3. Update lead with AI results
    if (aiAnalysis) {
      lead = await Lead.findByIdAndUpdate(
        lead._id,
        {
          leadScore: aiAnalysis.leadScore,
          priority: aiAnalysis.priority,
          aiAnalysis: aiAnalysis.aiAnalysis,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    // 4. Return updated lead
    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL LEADS
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET LEAD BY ID
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE LEAD
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE LEAD
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
