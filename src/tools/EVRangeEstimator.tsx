import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Trash2, Save, X, Database } from 'lucide-react';

export default function EVRangeEstimator() {
  const [dataPoints, setDataPoints] = useState([]);
  const [formData, setFormData] = useState({
    time: '',
    distanceToDestination: '',
    batteryPercent: '',
    carEstimatedRange: '',
    minutesRemaining: ''
  });
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvText, setCSVText] = useState('');
  const [showProjection, setShowProjection] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('evRangeData');
    if (saved) {
      setDataPoints(JSON.parse(saved));
    }
  }, []);

  const saveDataPoint = () => {
    const newPoint = {
      id: Date.now(),
      time: formData.time,
      distanceToDestination: parseFloat(formData.distanceToDestination),
      batteryPercent: parseFloat(formData.batteryPercent),
      carEstimatedRange: parseFloat(formData.carEstimatedRange),
      minutesRemaining: parseFloat(formData.minutesRemaining),
      timestamp: new Date().toISOString()
    };

    const updatedPoints = [...dataPoints, newPoint];
    updatedPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setDataPoints(updatedPoints);
    localStorage.setItem('evRangeData', JSON.stringify(updatedPoints));
    
    setFormData({
      time: '',
      distanceToDestination: '',
      batteryPercent: '',
      carEstimatedRange: '',
      minutesRemaining: ''
    });
  };

  const deleteDataPoint = (id) => {
    const updatedPoints = dataPoints.filter(p => p.id !== id);
    setDataPoints(updatedPoints);
    localStorage.setItem('evRangeData', JSON.stringify(updatedPoints));
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setDataPoints([]);
      localStorage.removeItem('evRangeData');
    }
  };

  const copyDataAsCSV = async () => {
    setCSVText(getCSVContent());
    setShowCSVModal(true);
  };

  const getCSVContent = () => {
    const headers = ['Time', 'Distance (km)', 'Minutes to Destination', 'Battery %', 'Car Range (km)'];
    const rows = dataPoints.map(point => [
      point.time,
      point.distanceToDestination,
      point.minutesRemaining,
      point.batteryPercent,
      point.carEstimatedRange
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  const getCSVHeaders = () => {
    return 'Time,Distance (km),Minutes to Destination,Battery %,Car Range (km)';
  };

  const clearCSV = () => {
    setCSVText(getCSVHeaders());
  };

  const saveCSVData = () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV must have at least a header row and one data row');
        return;
      }

      const newDataPoints = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 5) {
          newDataPoints.push({
            id: Date.now() + i,
            time: values[0].trim(),
            distanceToDestination: parseFloat(values[1].trim()),
            minutesRemaining: parseFloat(values[2].trim()),
            batteryPercent: parseFloat(values[3].trim()),
            carEstimatedRange: parseFloat(values[4].trim()),
            timestamp: new Date().toISOString()
          });
        }
      }

      if (newDataPoints.length === 0) {
        alert('No valid data rows found');
        return;
      }

      newDataPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setDataPoints(newDataPoints);
      localStorage.setItem('evRangeData', JSON.stringify(newDataPoints));
      setShowCSVModal(false);
      alert('Data imported successfully!');
    } catch (error) {
      alert('Error parsing CSV. Please check the format.');
      console.error(error);
    }
  };

  // Calculate adjusted range estimate
  const calculateAdjustedEstimate = () => {
    if (dataPoints.length < 2) return null;

    let totalErrorFactor = 0;
    let validPoints = 0;

    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      
      const actualDistanceTraveled = prev.distanceToDestination - curr.distanceToDestination;
      const estimatedDistanceTraveled = prev.carEstimatedRange - curr.carEstimatedRange;
      
      if (estimatedDistanceTraveled > 0 && actualDistanceTraveled > 0) {
        const errorFactor = actualDistanceTraveled / estimatedDistanceTraveled;
        totalErrorFactor += errorFactor;
        validPoints++;
      }
    }

    if (validPoints === 0) return null;

    const avgErrorFactor = totalErrorFactor / validPoints;
    const latestPoint = dataPoints[dataPoints.length - 1];
    const adjustedRange = latestPoint.carEstimatedRange * avgErrorFactor;

    return {
      carEstimate: latestPoint.carEstimatedRange,
      adjustedEstimate: adjustedRange,
      errorFactor: avgErrorFactor,
      canReachDestination: adjustedRange >= latestPoint.distanceToDestination
    };
  };

  const estimate = calculateAdjustedEstimate();

  // Calculate error factors with battery levels for regression
  const getErrorFactorData = () => {
    if (dataPoints.length < 2) return [];

    const errorData = [];
    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      
      const actualDistanceTraveled = prev.distanceToDestination - curr.distanceToDestination;
      const estimatedDistanceTraveled = prev.carEstimatedRange - curr.carEstimatedRange;
      
      if (estimatedDistanceTraveled > 0 && actualDistanceTraveled > 0) {
        const errorFactor = actualDistanceTraveled / estimatedDistanceTraveled;
        errorData.push({
          battery: curr.batteryPercent,
          errorFactor: errorFactor
        });
      }
    }
    return errorData;
  };

  // Simple linear regression for error factor vs battery
  const linearRegression = (data) => {
    if (data.length < 2) return null;

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach(point => {
      sumX += point.battery;
      sumY += point.errorFactor;
      sumXY += point.battery * point.errorFactor;
      sumX2 += point.battery * point.battery;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  const errorFactorData = getErrorFactorData();
  const regression = linearRegression(errorFactorData);

  // Prepare chart data with adjusted estimates
  const chartData = dataPoints.map((point, idx) => {
    let adjustedEstimate = null;
    
    if (idx > 0) {
      let totalErrorFactor = 0;
      let validPoints = 0;
      
      for (let i = 1; i <= idx; i++) {
        const prev = dataPoints[i - 1];
        const curr = dataPoints[i];
        
        const actualDistanceTraveled = prev.distanceToDestination - curr.distanceToDestination;
        const estimatedDistanceTraveled = prev.carEstimatedRange - curr.carEstimatedRange;
        
        if (estimatedDistanceTraveled > 0 && actualDistanceTraveled > 0) {
          const errorFactor = actualDistanceTraveled / estimatedDistanceTraveled;
          totalErrorFactor += errorFactor;
          validPoints++;
        }
      }
      
      if (validPoints > 0) {
        const avgErrorFactor = totalErrorFactor / validPoints;
        adjustedEstimate = point.carEstimatedRange * avgErrorFactor;
      }
    }
    
    return {
      name: point.time,
      'Distance to Destination': point.distanceToDestination,
      'Car Estimated Range': point.carEstimatedRange,
      'Adjusted Estimate': adjustedEstimate,
      'Battery %': point.batteryPercent,
      isProjection: false
    };
  });

  // Generate projection data
  const generateProjection = () => {
    if (dataPoints.length < 2) return [];

    const latestPoint = dataPoints[dataPoints.length - 1];
    const currentEstimate = calculateAdjustedEstimate();
    
    if (!currentEstimate || !latestPoint.minutesRemaining) return [];

    let totalDistanceRate = 0;
    let totalBatteryRate = 0;
    let totalRangeRate = 0;
    let validIntervals = 0;

    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      
      if (prev.minutesRemaining && curr.minutesRemaining) {
        const timeElapsed = prev.minutesRemaining - curr.minutesRemaining;
        if (timeElapsed > 0) {
          totalDistanceRate += (prev.distanceToDestination - curr.distanceToDestination) / timeElapsed;
          totalBatteryRate += (prev.batteryPercent - curr.batteryPercent) / timeElapsed;
          totalRangeRate += (prev.carEstimatedRange - curr.carEstimatedRange) / timeElapsed;
          validIntervals++;
        }
      }
    }

    if (validIntervals === 0) return [];

    const avgDistanceRate = totalDistanceRate / validIntervals;
    const avgBatteryRate = totalBatteryRate / validIntervals;
    const avgRangeRate = totalRangeRate / validIntervals;

    const projectionPoints = [];
    let minutesElapsed = 0;
    const maxMinutes = latestPoint.minutesRemaining;

    // Project in 5-minute intervals
    while (minutesElapsed < maxMinutes && projectionPoints.length < 20) {
      minutesElapsed += 5;
      
      if (minutesElapsed > maxMinutes) break;
      
      const projectedDistance = Math.max(0, latestPoint.distanceToDestination - (avgDistanceRate * minutesElapsed));
      const projectedBattery = Math.max(0, latestPoint.batteryPercent - (avgBatteryRate * minutesElapsed));
      const projectedRange = Math.max(0, latestPoint.carEstimatedRange - (avgRangeRate * minutesElapsed));
      const projectedAdjusted = Math.max(0, projectedRange * currentEstimate.errorFactor);

      const projectedTime = new Date(new Date().getTime() + minutesElapsed * 60000);
      const timeStr = projectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      projectionPoints.push({
        name: timeStr,
        'Distance to Destination': projectedDistance,
        'Car Estimated Range': projectedRange,
        'Adjusted Estimate': projectedAdjusted,
        isProjection: true
      });

      if (projectedDistance <= 0) break;
    }

    // Add final point at exact arrival time
    if (projectionPoints.length === 0 || minutesElapsed < maxMinutes) {
      const finalDistance = Math.max(0, latestPoint.distanceToDestination - (avgDistanceRate * maxMinutes));
      const finalBattery = Math.max(0, latestPoint.batteryPercent - (avgBatteryRate * maxMinutes));
      const finalRange = Math.max(0, latestPoint.carEstimatedRange - (avgRangeRate * maxMinutes));
      const finalAdjusted = Math.max(0, finalRange * currentEstimate.errorFactor);

      const finalTime = new Date(new Date().getTime() + maxMinutes * 60000);
      const timeStr = finalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      projectionPoints.push({
        name: timeStr,
        'Distance to Destination': finalDistance,
        'Car Estimated Range': finalRange,
        'Adjusted Estimate': finalAdjusted,
        isProjection: true
      });
    }

    return projectionPoints;
  };

  const projectionData = showProjection ? generateProjection() : [];
  const combinedChartData = showProjection ? [...chartData, ...projectionData] : chartData;

  // Generate regression line points
  const regressionChartData = errorFactorData.length > 0 ? (() => {
    const minBattery = Math.min(...errorFactorData.map(d => d.battery));
    const maxBattery = Math.max(...errorFactorData.map(d => d.battery));
    const result = [];
    
    errorFactorData.forEach(point => {
      result.push({
        battery: point.battery,
        'Actual Error Factor': point.errorFactor,
        'Trend Line': regression ? regression.slope * point.battery + regression.intercept : null
      });
    });

    if (regression) {
      for (let battery = Math.floor(minBattery); battery <= Math.ceil(maxBattery); battery += 1) {
        if (!result.find(p => p.battery === battery)) {
          result.push({
            battery: battery,
            'Actual Error Factor': null,
            'Trend Line': regression.slope * battery + regression.intercept
          });
        }
      }
    }

    return result.sort((a, b) => b.battery - a.battery);
  })() : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">EV Range Estimator</h1>

        {/* CSV Modal */}
        {showCSVModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCSVModal(false)}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">CSV Data</h3>
                <button
                  onClick={() => setShowCSVModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCSVText(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
              />
              <p className="text-sm text-gray-600 mt-4 mb-2">Edit the CSV data and click Save to import changes</p>
              <div className="flex gap-2">
                <button
                  onClick={saveCSVData}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save size={16} />
                  Save Changes
                </button>
                <button
                  onClick={clearCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Data Point</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance to Destination (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.distanceToDestination}
                onChange={(e) => setFormData({...formData, distanceToDestination: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minutes to Destination
              </label>
              <input
                type="number"
                step="1"
                value={formData.minutesRemaining}
                onChange={(e) => setFormData({...formData, minutesRemaining: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Battery %
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.batteryPercent}
                onChange={(e) => setFormData({...formData, batteryPercent: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car's Est. Range (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.carEstimatedRange}
                onChange={(e) => setFormData({...formData, carEstimatedRange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveDataPoint}
              disabled={!formData.time || !formData.distanceToDestination || !formData.batteryPercent || !formData.carEstimatedRange || !formData.minutesRemaining}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Save
            </button>
            {dataPoints.length > 0 && (
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-auto"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Adjusted Estimate Display */}
        {estimate && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Adjusted Range Estimate</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Car's Estimate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {estimate.carEstimate.toFixed(1)} km
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Adjusted Estimate</div>
                <div className="text-2xl font-bold text-green-600">
                  {estimate.adjustedEstimate.toFixed(1)} km
                </div>
              </div>
              <div className={`p-4 rounded-lg ${estimate.canReachDestination ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-sm text-gray-600">Can Reach Destination?</div>
                <div className={`text-2xl font-bold ${estimate.canReachDestination ? 'text-green-600' : 'text-red-600'}`}>
                  {estimate.canReachDestination ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Error Factor: {estimate.errorFactor.toFixed(3)} (Car estimates are {estimate.errorFactor > 1 ? 'conservative' : 'optimistic'} by {Math.abs((1 - estimate.errorFactor) * 100).toFixed(1)}%)
            </div>
          </div>
        )}

        {/* Chart */}
        {dataPoints.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Range Over Time</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProjection}
                  onChange={(e) => setShowProjection(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Show Projection</span>
              </label>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => value.toFixed(2)} />
                <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)} />
                <Legend />
                
                {/* Vertical line at the last actual data point */}
                {showProjection && chartData.length > 0 && (
                  <ReferenceLine 
                    x={chartData[chartData.length - 1].name} 
                    stroke="#666" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: 'Projection →', position: 'top', fill: '#666', fontSize: 12 }}
                  />
                )}
                
                <Line 
                  type="monotone" 
                  dataKey="Distance to Destination" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { payload, cx, cy } = props;
                    if (payload.isProjection) return null;
                    return <circle cx={cx} cy={cy} r={4} fill="#ef4444" />;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Car Estimated Range" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { payload, cx, cy } = props;
                    if (payload.isProjection) return null;
                    return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" />;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Adjusted Estimate" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { payload, cx, cy } = props;
                    if (payload.isProjection) return null;
                    return <circle cx={cx} cy={cy} r={4} fill="#10b981" />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Error Factor Regression Chart */}
        {errorFactorData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Error Factor vs Battery Level</h2>
            <p className="text-sm text-gray-600 mb-4">
              This shows how the car's estimation accuracy changes as battery depletes. 
              Values above 1.0 mean the car is conservative (you get more range than estimated).
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={regressionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="battery" 
                  label={{ value: 'Battery %', position: 'insideBottom', offset: -5 }}
                  reversed
                  type="number"
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <YAxis 
                  label={{ value: 'Error Factor', angle: -90, position: 'insideLeft' }}
                  domain={[0, 'auto']}
                />
                <Tooltip formatter={(value) => value ? value.toFixed(3) : 'N/A'} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Actual Error Factor" 
                  stroke="#10b981" 
                  strokeWidth={0}
                  dot={{ fill: '#10b981', r: 6 }}
                  connectNulls={false}
                />
                {regression && (
                  <Line 
                    type="monotone" 
                    dataKey="Trend Line" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                    connectNulls={true}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Table */}
        {dataPoints.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Data Points</h2>
              <button
                onClick={copyDataAsCSV}
                className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                title="Export/Import CSV"
              >
                <Database size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Distance (km)</th>
                    <th className="text-left py-2 px-4">Minutes Left</th>
                    <th className="text-left py-2 px-4">Battery %</th>
                    <th className="text-left py-2 px-4">Car Range (km)</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPoints.map((point) => (
                    <tr key={point.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{point.time}</td>
                      <td className="py-2 px-4">{typeof point.distanceToDestination === 'number' ? point.distanceToDestination.toFixed(2) : point.distanceToDestination}</td>
                      <td className="py-2 px-4">{typeof point.minutesRemaining === 'number' ? point.minutesRemaining.toFixed(0) : point.minutesRemaining}</td>
                      <td className="py-2 px-4">{typeof point.batteryPercent === 'number' ? point.batteryPercent.toFixed(2) : point.batteryPercent}%</td>
                      <td className="py-2 px-4">{typeof point.carEstimatedRange === 'number' ? point.carEstimatedRange.toFixed(2) : point.carEstimatedRange}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => deleteDataPoint(point.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}