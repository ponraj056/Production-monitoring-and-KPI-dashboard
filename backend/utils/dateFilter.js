exports.getTimeFilter = (timeRange, hasExistingWhere = false) => {
  let condition = '';
  if (timeRange === 'today') condition = `logged_at >= CURRENT_DATE`;
  else if (timeRange === 'week') condition = `logged_at >= CURRENT_DATE - INTERVAL '7 days'`;
  else if (timeRange === 'month') condition = `logged_at >= CURRENT_DATE - INTERVAL '30 days'`;
  
  if (!condition) return '';
  return hasExistingWhere ? ` AND ${condition}` : ` WHERE ${condition}`;
};
