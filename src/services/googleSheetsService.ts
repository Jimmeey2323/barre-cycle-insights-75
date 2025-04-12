
import axios from 'axios';

const SPREADSHEET_ID = "1JG6yAClbjr3iF1kapJHS-pf0G539afUpo-OdcMylnOI";
let credentials = {
  access_token: "",
  refresh_token: "1//04MmvT_BibTsBCgYIARAAGAQSNwF-L9IrG9yxJvvQRMLPR39xzWSrqfTVMkvq3WcZqsDO2HjUkV6s7vo1pQkex4qGF3DITTiweAA",
  expires_in: 3599,
  scope: "https://www.googleapis.com/auth/spreadsheets",
  token_type: "Bearer",
  expiration_time: 0
};

export async function refreshAccessToken() {
  try {
    console.log("Refreshing access token...");
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
        client_secret: "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",
        refresh_token: credentials.refresh_token,
        grant_type: "refresh_token"
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const tokenData = response.data;
    credentials.access_token = tokenData.access_token;
    credentials.expiration_time = Date.now() + (tokenData.expires_in * 1000);
    console.log("Token refreshed successfully");
    return credentials.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error('Failed to refresh access token');
  }
}

export async function getAccessToken() {
  if (!credentials.access_token || Date.now() > credentials.expiration_time) {
    console.log("Access token missing or expired, refreshing...");
    return await refreshAccessToken();
  }
  return credentials.access_token;
}

export async function fetchSheetData(sheetId: string, sheetName: string) {
  try {
    const token = await getAccessToken();
    console.log("Fetching sheet data with token");
    
    const encodedSheetName = encodeURIComponent(sheetName);
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedSheetName}!A:AB`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.data || !response.data.values || response.data.values.length < 2) {
      throw new Error('Invalid sheet data received');
    }

    // Extract headers from the first row
    const headers = response.data.values[0];
    
    // Map the rest of the rows using the headers
    const rows = response.data.values.slice(1).map((row: any[]) => {
      const obj: Record<string, string> = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] !== undefined ? row[index] : '';
      });
      return obj;
    });
    
    return rows;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

export function processFitnessData(rawData: any[]) {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    console.error("Invalid raw data:", rawData);
    return null;
  }

  try {
    // Get unique month-year combinations
    const monthYears = Array.from(new Set(rawData.map(item => item["Month Year"])))
      .filter(month => month); // Filter out empty values

    // Get unique locations
    const locations = Array.from(new Set(rawData.map(item => item["Location"])))
      .filter(location => location);
      
    // Get unique teachers/trainers
    const trainers = Array.from(new Set(rawData.map(item => item["Teacher Name"])))
      .filter(trainer => trainer);
      
    // Get unique class types
    const classTypes = ["Barre", "Cycle"];

    // Process monthly statistics
    const monthlyStats = monthYears.map(monthYear => {
      const monthData = rawData.filter(item => item["Month Year"] === monthYear);
      
      // Extract location (using the first entry's location as a placeholder when there are multiple)
      const sampleLocation = monthData[0]?.Location || "";
      
      const totalBarreSessions = monthData.reduce((sum, item) => sum + parseInt(item["Barre Sessions"] || "0"), 0);
      const totalCycleSessions = monthData.reduce((sum, item) => sum + parseInt(item["Cycle Sessions"] || "0"), 0);
      
      const totalBarreCustomers = monthData.reduce((sum, item) => sum + parseInt(item["Barre Customers"] || "0"), 0);
      const totalCycleCustomers = monthData.reduce((sum, item) => sum + parseInt(item["Cycle Customers"] || "0"), 0);
      
      const totalBarrePaid = monthData.reduce((sum, item) => sum + parseFloat(item["Barre Paid"] || "0"), 0);
      const totalCyclePaid = monthData.reduce((sum, item) => sum + parseFloat(item["Cycle Paid"] || "0"), 0);
      
      const totalNonEmptyBarreSessions = monthData.reduce((sum, item) => {
        const sessions = parseInt(item["Non-Empty Barre Sessions"] || "0");
        return sum + (isNaN(sessions) ? 0 : sessions);
      }, 0);
      
      const totalNonEmptyCycleSessions = monthData.reduce((sum, item) => {
        const sessions = parseInt(item["Non-Empty Cycle Sessions"] || "0");
        return sum + (isNaN(sessions) ? 0 : sessions);
      }, 0);
      
      // Calculate average class sizes
      const avgBarreClassSize = totalNonEmptyBarreSessions > 0 
        ? (totalBarreCustomers / totalNonEmptyBarreSessions).toFixed(1) 
        : "0";
        
      const avgCycleClassSize = totalNonEmptyCycleSessions > 0 
        ? (totalCycleCustomers / totalNonEmptyCycleSessions).toFixed(1) 
        : "0";
        
      // Calculate retention and conversion metrics  
      const totalRetained = monthData.reduce((sum, item) => {
        const retained = parseInt(item["Retained"] || "0");
        return sum + (isNaN(retained) ? 0 : retained);
      }, 0);
      
      const totalConverted = monthData.reduce((sum, item) => {
        const converted = parseInt(item["Converted"] || "0");
        return sum + (isNaN(converted) ? 0 : converted);
      }, 0);
      
      const totalNew = monthData.reduce((sum, item) => {
        const newCustomers = parseInt(item["New"] || "0");
        return sum + (isNaN(newCustomers) ? 0 : newCustomers);
      }, 0);
      
      // Calculate most popular class
      const mostPopularClass = totalBarreCustomers > totalCycleCustomers ? "Barre" : 
                               totalCycleCustomers > totalBarreCustomers ? "Cycle" : 
                               "Tie";
        
      return {
        monthYear,
        month: monthYear.split('-')[0],
        Location: sampleLocation, // Added Location property to monthlyStats
        totalSessions: totalBarreSessions + totalCycleSessions,
        barreSessions: totalBarreSessions,
        cycleSessions: totalCycleSessions,
        barreCustomers: totalBarreCustomers,
        cycleCustomers: totalCycleCustomers,
        barrePaid: totalBarrePaid,
        cyclePaid: totalCyclePaid,
        totalRevenue: totalBarrePaid + totalCyclePaid,
        avgClassSize: (totalBarreSessions + totalCycleSessions) > 0 ?
          ((totalBarreCustomers + totalCycleCustomers) / (totalBarreSessions + totalCycleSessions)) : 0,
        totalBarreSessions,
        totalCycleSessions,
        totalBarreCustomers,
        totalCycleCustomers,
        totalBarrePaid,
        totalCyclePaid,
        avgBarreClassSize,
        avgCycleClassSize,
        totalRetained,
        totalConverted,
        totalNew,
        mostPopularClass // Add most popular class information
      };
    });

    // Process teacher statistics
    const teacherStats = trainers.map(teacher => {
      const teacherData = rawData.filter(item => item["Teacher Name"] === teacher);
      
      const barreSessions = teacherData.reduce((sum, item) => {
        const sessions = parseInt(item["Barre Sessions"] || "0");
        return sum + (isNaN(sessions) ? 0 : sessions);
      }, 0);
      
      const cycleSessions = teacherData.reduce((sum, item) => {
        const sessions = parseInt(item["Cycle Sessions"] || "0");
        return sum + (isNaN(sessions) ? 0 : sessions);
      }, 0);
      
      const barreCustomers = teacherData.reduce((sum, item) => {
        const customers = parseInt(item["Barre Customers"] || "0");
        return sum + (isNaN(customers) ? 0 : customers);
      }, 0);
      
      const cycleCustomers = teacherData.reduce((sum, item) => {
        const customers = parseInt(item["Cycle Customers"] || "0");
        return sum + (isNaN(customers) ? 0 : customers);
      }, 0);
      
      const barrePaid = teacherData.reduce((sum, item) => {
        const paid = parseFloat(item["Barre Paid"] || "0");
        return sum + (isNaN(paid) ? 0 : paid);
      }, 0);
      
      const cyclePaid = teacherData.reduce((sum, item) => {
        const paid = parseFloat(item["Cycle Paid"] || "0");
        return sum + (isNaN(paid) ? 0 : paid);
      }, 0);
      
      const teacherEmail = teacherData[0]["Teacher Email"] || "";
      
      // Calculate average class sizes
      const avgBarreClassSize = barreSessions > 0 ? barreCustomers / barreSessions : 0;
      const avgCycleClassSize = cycleSessions > 0 ? cycleCustomers / cycleSessions : 0;
      
      // Calculate most taught class
      const mostTaughtClass = barreSessions > cycleSessions ? "Barre" : 
                              cycleSessions > barreSessions ? "Cycle" : 
                              "Both equally";
      
      return {
        name: teacher,
        email: teacherEmail,
        barreSessions,
        cycleSessions,
        barreCustomers,
        cycleCustomers,
        barrePaid,
        cyclePaid,
        totalSessions: barreSessions + cycleSessions,
        avgBarreClassSize,
        avgCycleClassSize,
        mostTaughtClass // Add most taught class information
      };
    });

    return {
      rawData,
      monthlyStats,
      teacherStats,
      locations,
      months: monthYears, // Set months to monthYears array
      trainers,
      classTypes,
      teachers: trainers // For backwards compatibility
    };
  } catch (error) {
    console.error("Error processing fitness data:", error);
    return null;
  }
}
