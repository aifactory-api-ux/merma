import React from 'react';

export default function DashboardPage(props) {
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={props.onLogout}>Logout</button>
      <button onClick={props.onRefresh}>Refresh</button>
      <div>
        <h2>Alerts</h2>
        {props.alertsLoading ? 'Loading...' : JSON.stringify(props.alerts)}
      </div>
      <div>
        <h2>Recommendations</h2>
        {props.recommendationsLoading ? 'Loading...' : JSON.stringify(props.recommendations)}
      </div>
      <div>
        <h2>Predictions</h2>
        {props.predictionsLoading ? 'Loading...' : JSON.stringify(props.predictions)}
      </div>
      <div>
        <h2>Inventory</h2>
        {props.inventoryLoading ? 'Loading...' : JSON.stringify(props.inventory)}
      </div>
    </div>
  );
}
