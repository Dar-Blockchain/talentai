/**
 * Export interview data as JSON
 * This function retrieves the interview data and exports it as a downloadable JSON file
 */

/**
 * Export interview data to JSON file
 * Call this function to download the interview data as a .json file
 */
export function exportInterviewDataAsJSON(): void {
  try {
    // Get data from localStorage
    const storedAnalysis = localStorage.getItem('last_interview_analysis');

    if (!storedAnalysis) {
      console.error('❌ No interview data found in localStorage');
      alert('No interview data available to export');
      return;
    }

    const parsedData = JSON.parse(storedAnalysis);

    // Get additional metadata
    const skill = localStorage.getItem('interview_skill');
    const role = localStorage.getItem('interview_role');
    const category = localStorage.getItem('interview_category');
    const proficiency = localStorage.getItem('interview_proficiency');

    // Create complete export object
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        skill: skill || 'N/A',
        role: role || 'N/A',
        category: category || 'N/A',
        proficiency: proficiency || 'N/A'
      },
      interviewData: parsedData
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-data-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('❌ Error exporting interview data:', error);
    alert('Failed to export interview data');
  }
}

/**
 * Get interview data as JSON string
 * Returns the interview data as a formatted JSON string
 */
export function getInterviewDataJSON(): string {
  try {
    const storedAnalysis = localStorage.getItem('last_interview_analysis');

    if (!storedAnalysis) {
      return JSON.stringify({ error: 'No interview data found' }, null, 2);
    }

    const parsedData = JSON.parse(storedAnalysis);

    // Get additional metadata
    const skill = localStorage.getItem('interview_skill');
    const role = localStorage.getItem('interview_role');

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        skill: skill || 'N/A',
        role: role || 'N/A'
      },
      interviewData: parsedData
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('❌ Error getting interview data:', error);
    return JSON.stringify({ error: 'Failed to retrieve interview data' }, null, 2);
  }
}

/**
 * Copy interview data to clipboard as JSON
 */
export async function copyInterviewDataToClipboard(): Promise<boolean> {
  try {
    const jsonString = getInterviewDataJSON();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(jsonString);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = jsonString;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (error) {
    console.error('❌ Error copying interview data:', error);
    return false;
  }
}

/**
 * Log interview data to console in a copyable format
 */
export function logInterviewDataToConsole(): void {
  try {
    getInterviewDataJSON();
  } catch (error) {
    console.error('❌ Error logging interview data:', error);
  }
}

// Make functions available globally in browser console for easy access
if (typeof window !== 'undefined') {
  (window as any).exportInterviewDataAsJSON = exportInterviewDataAsJSON;
  (window as any).getInterviewDataJSON = getInterviewDataJSON;
  (window as any).copyInterviewDataToClipboard = copyInterviewDataToClipboard;
  (window as any).logInterviewDataToConsole = logInterviewDataToConsole;
}
