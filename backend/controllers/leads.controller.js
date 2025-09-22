const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const UploadBatch = require('../models/UploadBatch');
const Lead = require('../models/Lead');
const { parseCSV, parseExcel } = require('../utils/parse');
const { distributeLeads } = require('../utils/leadsDistribute');

const uploadLeads =  async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const fileExt = path.extname(req.file.filename).toLowerCase();
    let leads = [];

    if (fileExt === '.csv') {
      leads = await parseCSV(req.file.path);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      leads = parseExcel(req.file.path);
    }

    if (!leads || leads.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'No valid data found in the file'
      });
    }

    const invalidLeads = leads.filter(lead => 
      !lead.FirstName || !lead.Phone
    );

    if (invalidLeads.length > 0) {
      fs.unlinkSync(req.file.path); 
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Ensure all rows have FirstName and Phone fields.',
        invalidRows: invalidLeads.length
      });
    }

    const agents = await User.find({ role: 'agent', isActive: true });

    if (agents.length === 0) {
      fs.unlinkSync(req.file.path); 
      return res.status(400).json({
        success: false,
        message: 'No active agents found. Please add agents before uploading leads.'
      });
    }

    const distributedLeads = distributeLeads(leads, agents);

    const uploadBatch = new UploadBatch({
      filename: req.file.originalname,
      totalLeads: leads.length,
      uploadedBy: req.userId,
      distributionSummary: distributedLeads.map(item => ({
        agent: item.agentId,
        assignedCount: item.leads.length
      }))
    });

    await uploadBatch.save();

    const savedLeads = [];
    for (const distribution of distributedLeads) {
      for (const lead of distribution.leads) {
        const newLead = new Lead({
          firstName: lead.FirstName,
          phone: lead.Phone.toString(),
          notes: lead.Notes || '',
          assignedTo: distribution.agentId,
          uploadBatch: uploadBatch._id
        });
        savedLeads.push(newLead.save());
      }
    }

    await Promise.all(savedLeads);

    fs.unlinkSync(req.file.path);

    const distributionSummary = await Promise.all(
      distributedLeads.map(async (item) => {
        const agent = agents.find(a => a._id.toString() === item.agentId.toString());
        return {
          agentName: agent.name,
          agentEmail: agent.email,
          assignedCount: item.leads.length
        };
      })
    );

    res.json({
      success: true,
      message: 'File uploaded and leads distributed successfully',
      summary: {
        totalLeads: leads.length,
        totalAgents: agents.length,
        distribution: distributionSummary
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing file'
    });
  }
}
const getAllLeads = async (req, res) => {
  try {
    const { agentId, status, batchId } = req.query;
    
    const query = {};
    if (agentId) query.assignedTo = agentId;
    if (status) query.status = status;
    if (batchId) query.uploadBatch = batchId;

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('uploadBatch', 'filename createdAt')
      .sort('-createdAt');

    res.json({
      success: true,
      leads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads'
    });
  }
}

const getLeedsByAgent = async (req, res) => {
  try {
    const leadsByAgent = await Lead.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          leads: { $push: '$$ROOT' },
          totalCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent'
        }
      },
      {
        $unwind: '$agent'
      },
      {
        $project: {
          agent: {
            id: '$agent._id',
            name: '$agent.name',
            email: '$agent.email'
          },
          totalCount: 1,
          leads: {
            $slice: ['$leads', 10] 
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: leadsByAgent
    });
  } catch (error) {
    console.error('Error fetching leads by agent:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads by agent'
    });
  }
}
module.exports = {uploadLeads, getAllLeads, getLeedsByAgent}