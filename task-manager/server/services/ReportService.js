const Task = require('../models/Task');
const Worklog = require('../models/Worklog');
const User = require('../models/User');

class ReportService {
  /**
   * Generate time report with task details and total hours
   * @returns {Promise<Object>} Report data with rows and grand total
   */
  static async generateTimeReport() {
    try {
      // Aggregate tasks with their worklogs and assignee info
      const reportData = await Task.aggregate([
        {
          $lookup: {
            from: 'worklogs',
            localField: '_id',
            foreignField: 'taskId',
            as: 'worklogs'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignee',
            foreignField: '_id',
            as: 'assigneeInfo'
          }
        },
        {
          $addFields: {
            totalHours: {
              $sum: '$worklogs.hours'
            },
            assigneeName: {
              $arrayElemAt: ['$assigneeInfo.name', 0]
            }
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            status: 1,
            assignee: '$assigneeName',
            estimatedHours: 1,
            actualHours: 1,
            totalHours: 1,
            boardId: 1
          }
        },
        {
          $sort: { totalHours: -1 }
        }
      ]);

      // Calculate grand total
      const grandTotalHours = reportData.reduce((sum, task) => sum + task.totalHours, 0);

      return {
        rows: reportData,
        grandTotalHours,
        totalTasks: reportData.length,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating time report:', error);
      throw new Error('Failed to generate time report');
    }
  }

  /**
   * Get worklog summary for a specific task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Task worklog summary
   */
  static async getTaskWorklogSummary(taskId) {
    try {
      const worklogs = await Worklog.find({ taskId })
        .populate('userId', 'name email')
        .sort({ date: -1 });

      const totalHours = worklogs.reduce((sum, log) => sum + log.hours, 0);

      return {
        taskId,
        worklogs,
        totalHours,
        count: worklogs.length
      };
    } catch (error) {
      console.error('Error getting task worklog summary:', error);
      throw new Error('Failed to get task worklog summary');
    }
  }

  /**
   * Get user worklog summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User worklog summary
   */
  static async getUserWorklogSummary(userId) {
    try {
      const worklogs = await Worklog.find({ userId })
        .populate('taskId', 'title status')
        .sort({ date: -1 });

      const totalHours = worklogs.reduce((sum, log) => sum + log.hours, 0);

      // Group by task
      const byTask = worklogs.reduce((acc, log) => {
        const taskId = log.taskId._id.toString();
        if (!acc[taskId]) {
          acc[taskId] = {
            task: log.taskId,
            hours: 0,
            logs: []
          };
        }
        acc[taskId].hours += log.hours;
        acc[taskId].logs.push(log);
        return acc;
      }, {});

      return {
        userId,
        worklogs,
        totalHours,
        byTask: Object.values(byTask),
        count: worklogs.length
      };
    } catch (error) {
      console.error('Error getting user worklog summary:', error);
      throw new Error('Failed to get user worklog summary');
    }
  }

  /**
   * Get report for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Date range report
   */
  static async getDateRangeReport(startDate, endDate) {
    try {
      const worklogs = await Worklog.find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
        .populate('taskId', 'title status')
        .populate('userId', 'name email')
        .sort({ date: -1 });

      // Aggregate by task
      const taskMap = new Map();
      let grandTotalHours = 0;

      worklogs.forEach(log => {
        const taskId = log.taskId._id.toString();
        if (!taskMap.has(taskId)) {
          taskMap.set(taskId, {
            task: log.taskId,
            totalHours: 0,
            worklogs: []
          });
        }
        const taskData = taskMap.get(taskId);
        taskData.totalHours += log.hours;
        taskData.worklogs.push(log);
        grandTotalHours += log.hours;
      });

      const rows = Array.from(taskMap.values()).map(data => ({
        title: data.task.title,
        status: data.task.status,
        assignee: 'Multiple', // Since multiple users can log time
        totalHours: data.totalHours
      }));

      return {
        rows,
        grandTotalHours,
        startDate,
        endDate,
        totalWorklogs: worklogs.length
      };
    } catch (error) {
      console.error('Error generating date range report:', error);
      throw new Error('Failed to generate date range report');
    }
  }
}

module.exports = ReportService;