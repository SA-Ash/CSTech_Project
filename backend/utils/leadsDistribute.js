function distributeLeads(leads, agents) {
  const totalLeads = leads.length;
  const totalAgents = agents.length;
  const leadsPerAgent = Math.floor(totalLeads / totalAgents);
  const remainingLeads = totalLeads % totalAgents;
  
  const distribution = [];
  let currentIndex = 0;
  
  for (let i = 0; i < totalAgents; i++) {
    const agentLeadCount = leadsPerAgent + (i < remainingLeads ? 1 : 0);
    const agentLeads = leads.slice(currentIndex, currentIndex + agentLeadCount);
    
    distribution.push({
      agentId: agents[i]._id,
      leads: agentLeads
    });
    
    currentIndex += agentLeadCount;
  }
  
  return distribution;
}
module.exports = {distributeLeads}