
// OAuth credentials
const credentials = {
  client_id: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  client_secret: "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",
  refresh_token: "1//04MmvT_BibTsBCgYIARAAGAQSNwF-L9IrG9yxJvvQRMLPR39xzWSrqfTVMkvq3WcZqsDO2HjUkV6s7vo1pQkex4qGF3DITTiweAA",
  scope: "https://www.googleapis.com/auth/spreadsheets",
  token_type: "Bearer",
};

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

// Refresh access token
const refreshAccessToken = async (): Promise<string> => {
  try {
    console.log("Refreshing access token...");
    const params = new URLSearchParams({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: credentials.refresh_token,
      grant_type: "refresh_token",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token refresh error:", errorText);
      throw new Error(`Failed to refresh token: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as TokenResponse;
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("expiration_time", (Date.now() + data.expires_in * 1000).toString());
    
    console.log("Token refreshed successfully");
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

// Get valid access token
const getAccessToken = async (): Promise<string> => {
  const storedToken = localStorage.getItem("access_token");
  const expirationTime = localStorage.getItem("expiration_time");

  // If token exists and is not expired, return it
  if (storedToken && expirationTime && Date.now() < parseInt(expirationTime)) {
    console.log("Using cached token");
    return storedToken;
  }

  // Otherwise refresh the token
  console.log("Token expired or not found, refreshing...");
  return refreshAccessToken();
};

// Fetch data from Google Sheets
export const fetchSheetData = async (spreadsheetId: string, sheetName: string): Promise<any[]> => {
  try {
    console.log(`Fetching data from ${sheetName}...`);
    const accessToken = await getAccessToken();
    const range = `${sheetName}!A:ZZ`;  // Fetch all columns
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

    console.log(`Making API request to ${url}`);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      throw new Error(`Failed to fetch sheet data: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Data received:", data);

    if (!data.values || data.values.length === 0) {
      console.warn("No data found in sheet");
      return [];
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    // Convert the data to an array of objects
    const processedData = rows.map((row: any[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });
    
    console.log(`Processed ${processedData.length} rows of data`);
    return processedData;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
};

// Process fitness data
export const processFitnessData = (data: any[]) => {
  console.log("Processing fitness data...", data?.length);
  if (!data || data.length === 0) return null;

  try {
    // Group data by month
    const monthlyData = data.reduce((acc: Record<string, any[]>, item) => {
      const monthYear = item["Month Year"];
      if (!monthYear) {
        console.warn("Item missing Month Year:", item);
        return acc;
      }
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(item);
      return acc;
    }, {});

    console.log("Monthly data groups:", Object.keys(monthlyData));

    // Calculate monthly aggregates
    const monthlyStats = Object.keys(monthlyData).map(monthYear => {
      const month = monthlyData[monthYear];
      
      const totalBarreSessions = month.reduce((sum, item) => sum + Number(item["Barre Sessions"] || 0), 0);
      const totalCycleSessions = month.reduce((sum, item) => sum + Number(item["Cycle Sessions"] || 0), 0);
      const totalBarreCustomers = month.reduce((sum, item) => sum + Number(item["Barre Customers"] || 0), 0);
      const totalCycleCustomers = month.reduce((sum, item) => sum + Number(item["Cycle Customers"] || 0), 0);
      const totalBarrePaid = month.reduce((sum, item) => sum + Number(item["Barre Paid"] || 0), 0);
      const totalCyclePaid = month.reduce((sum, item) => sum + Number(item["Cycle Paid"] || 0), 0);
      const totalNonEmptyBarreSessions = month.reduce((sum, item) => sum + Number(item["Non-Empty Barre Sessions"] || 0), 0);
      const totalNonEmptyCycleSessions = month.reduce((sum, item) => sum + Number(item["Non-Empty Cycle Sessions"] || 0), 0);
      
      const avgBarreClassSize = totalNonEmptyBarreSessions > 0 ? totalBarreCustomers / totalNonEmptyBarreSessions : 0;
      const avgCycleClassSize = totalNonEmptyCycleSessions > 0 ? totalCycleCustomers / totalNonEmptyCycleSessions : 0;
      
      const totalRetained = month.reduce((sum, item) => sum + Number(item["Retained"] || 0), 0);
      const totalConverted = month.reduce((sum, item) => sum + Number(item["Converted"] || 0), 0);
      
      return {
        monthYear,
        totalBarreSessions,
        totalCycleSessions,
        totalBarreCustomers,
        totalCycleCustomers,
        totalBarrePaid,
        totalCyclePaid,
        avgBarreClassSize: avgBarreClassSize.toFixed(1),
        avgCycleClassSize: avgCycleClassSize.toFixed(1),
        totalRetained,
        totalConverted
      };
    });

    console.log("Monthly stats calculated:", monthlyStats);

    // Sort by month year
    monthlyStats.sort((a, b) => {
      // Parse "MMM-YYYY" format
      const [aMonth, aYear] = a.monthYear.split('-');
      const [bMonth, bYear] = b.monthYear.split('-');
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const yearComparison = Number(aYear) - Number(bYear);
      if (yearComparison !== 0) return yearComparison;
      
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });
    
    console.log("Final processed data:", { 
      monthlyStats: monthlyStats.length, 
      rawData: data.length 
    });
    
    return {
      monthlyStats,
      rawData: data
    };
  } catch (error) {
    console.error("Error processing fitness data:", error);
    return null;
  }
};
