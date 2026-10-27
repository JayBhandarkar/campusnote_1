import { Department } from '../models/Department.js';
import { Subject } from '../models/Subject.js';
import { Unit } from '../models/Unit.js';
import { Resource } from '../models/Resource.js';
import { ApiError } from '../utils/ApiError.js';

export class AcademicService {
  // --- Departments ---
  static async getAllDepartments(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return await Department.find(filter).sort({ name: 1 });
  }

  static async getDepartmentById(id) {
    const department = await Department.findById(id);
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }
    return department;
  }

  static async createDepartment(data) {
    const existing = await Department.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ApiError(409, `Department with code '${data.code}' already exists`);
    }
    return await Department.create(data);
  }

  static async updateDepartment(id, data) {
    if (data.code) {
      const existing = await Department.findOne({
        code: data.code.toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(409, `Department with code '${data.code}' already exists`);
      }
    }

    const department = await Department.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }
    return department;
  }

  static async deleteDepartment(id) {
    // Check for dependent subjects
    const subjectCount = await Subject.countDocuments({ department: id });
    if (subjectCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete department because ${subjectCount} subject(s) are associated with it. Please reassign or delete the subjects first.`
      );
    }

    // Check for dependent resources
    const resourceCount = await Resource.countDocuments({ department: id, moderationStatus: { $ne: 'Removed' } });
    if (resourceCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete department because ${resourceCount} resource(s) reference it.`
      );
    }

    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }
    return department;
  }

  // --- Subjects ---
  static async getSubjects(filter = {}) {
    const query = {};
    if (filter.department) query.department = filter.department;
    if (filter.semester) query.semester = parseInt(filter.semester, 10);
    if (!filter.includeInactive) query.isActive = true;

    return await Subject.find(query)
      .populate('department', 'name code')
      .sort({ semester: 1, name: 1 });
  }

  static async getSubjectById(id) {
    const subject = await Subject.findById(id).populate('department', 'name code');
    if (!subject) {
      throw new ApiError(404, 'Subject not found');
    }
    return subject;
  }

  static async createSubject(data) {
    const department = await Department.findById(data.department);
    if (!department) {
      throw new ApiError(404, 'Department does not exist');
    }

    const existing = await Subject.findOne({
      code: data.code.toUpperCase(),
      department: data.department,
    });
    if (existing) {
      throw new ApiError(
        409,
        `Subject with code '${data.code}' already exists in ${department.name}`
      );
    }

    const subject = await Subject.create(data);
    return await subject.populate('department', 'name code');
  }

  static async updateSubject(id, data) {
    if (data.department) {
      const department = await Department.findById(data.department);
      if (!department) {
        throw new ApiError(404, 'Department does not exist');
      }
    }

    if (data.code) {
      const current = await Subject.findById(id);
      if (!current) throw new ApiError(404, 'Subject not found');

      const deptId = data.department || current.department;
      const existing = await Subject.findOne({
        code: data.code.toUpperCase(),
        department: deptId,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(409, `Subject code '${data.code}' already exists in this department`);
      }
    }

    const subject = await Subject.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('department', 'name code');

    if (!subject) {
      throw new ApiError(404, 'Subject not found');
    }
    return subject;
  }

  static async deleteSubject(id) {
    const unitCount = await Unit.countDocuments({ subject: id });
    if (unitCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete subject because ${unitCount} unit(s) are associated with it. Please remove the units first.`
      );
    }

    const resourceCount = await Resource.countDocuments({ subject: id, moderationStatus: { $ne: 'Removed' } });
    if (resourceCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete subject because ${resourceCount} resource(s) reference it.`
      );
    }

    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      throw new ApiError(404, 'Subject not found');
    }
    return subject;
  }

  // --- Units ---
  static async getUnitsBySubject(subjectId) {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new ApiError(404, 'Subject not found');
    }

    return await Unit.find({ subject: subjectId }).sort({ unitNumber: 1 });
  }

  static async getUnitById(id) {
    const unit = await Unit.findById(id).populate({
      path: 'subject',
      populate: { path: 'department', select: 'name code' },
    });
    if (!unit) {
      throw new ApiError(404, 'Unit not found');
    }
    return unit;
  }

  static async createUnit(data) {
    const subject = await Subject.findById(data.subject);
    if (!subject) {
      throw new ApiError(404, 'Subject does not exist');
    }

    const existing = await Unit.findOne({
      subject: data.subject,
      unitNumber: data.unitNumber,
    });
    if (existing) {
      throw new ApiError(
        409,
        `Unit ${data.unitNumber} already exists for subject '${subject.name}'`
      );
    }

    const unit = await Unit.create(data);
    return await unit.populate('subject', 'name code semester');
  }

  static async updateUnit(id, data) {
    if (data.unitNumber) {
      const current = await Unit.findById(id);
      if (!current) throw new ApiError(404, 'Unit not found');

      const subjectId = data.subject || current.subject;
      const existing = await Unit.findOne({
        subject: subjectId,
        unitNumber: data.unitNumber,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(409, `Unit ${data.unitNumber} already exists for this subject`);
      }
    }

    const unit = await Unit.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name code semester');

    if (!unit) {
      throw new ApiError(404, 'Unit not found');
    }
    return unit;
  }

  static async deleteUnit(id) {
    const resourceCount = await Resource.countDocuments({ unit: id, moderationStatus: { $ne: 'Removed' } });
    if (resourceCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete unit because ${resourceCount} resource(s) reference it.`
      );
    }

    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) {
      throw new ApiError(404, 'Unit not found');
    }
    return unit;
  }
}
