/* eslint-disable max-len */
import { Bijection } from '../utils/bijection';

const zhjwInfoNameMap = new Bijection(
    [
        ...['学号：', '姓名：', '英文姓名：', '学生类别：', '性别：', '婚姻状况：', '原学历：'],
        ...['常用电子邮箱：', '电子邮件', '联系电话座机：', '联系电话手机：'],
        ...['大学毕校：', '大学毕校代码：', '大学专业：', '大学专业代码：', '本科学号：'],
        ...['硕士毕校：', '硕士毕校代码：', '硕士专业：', '硕士专业代码：', '硕士学号：'],
        ...['院（系，所）：', '专业：', '专业代码：', '是否留学生：'],
        '政治面貌：',
        ...['国家/地区：', '证件类型：', '身份证号：', '证件号：', '导师姓名：', '导师证号：'],
        '出生日期：',
        ...['入学年月：', '毕业日期：', '大学毕业年月：', '获硕日期：'],
        ...['教学班：', '是否辅修：', '是否在校：', '是否有学籍：', '收费类别：']
    ],
    [
        ...[ 'studentId', 'name', 'englishName', 'studentType', 'gender', 'marriage', 'birthday'],
        ...[ 'email', 'email', 'phone', 'mobile'],
        'educationLevel',
        ...['ugSchool', 'ugSchoolCode', 'ugMajor', 'ugMajorCode', 'ugId'],
        ...['pgSchool', 'pgSchoolCode', 'pgMajor', 'pgMajorCode', 'pgId'],
        ...['department', 'major', 'majorCode', 'isAbroad', 'tutor', 'tutorId'],
        'politicsStatus',
        ...['region', 'idType', 'nationId', 'nationId'],
        ...['joinDate', 'graduationDate', 'ugDate', 'pgDate'],
        ...['class', 'hasMinor', 'isInSchool', 'isValid', 'chargeType']
    ]
);

const zhjwCourseNameMap = new Bijection(
    [
        ...['课程号', '课序号', '课程名'],
        ...['学分', '学时', '成绩', '绩点'],
        ...['替代课程', '是否学位课', '课程性质'],
        ...['课程属性', '特殊课程标志', '学年学期', '学年-学期', '考试时间', '考核方式']
    ],
    [
        ...['courseId', 'courseIndex', 'courseName'],
        ...['credit', 'hour', 'grade', 'gpa'],
        ...['courseSubstituted', 'isDegreeCourse', 'isDegreeCourse'],
        ...['type', 'flag', 'semester', 'semester', 'examTime', 'examType']
    ]
);

const zhjwExamNameMap = new Bijection(
    [
        ...['课程号', '课序号', '课程名'],
        ...['开课系', '课程分类', '教师'],
        ...['人数', '考试日期', '考场']
    ],
    [
        ...['courseId', 'courseIndex', 'courseName'],
        ...['department', 'courseType', 'teacher'],
        ...['size', 'datetime', 'place']
    ]
);

const zhjwCourseGroupNameMap = new Bijection(
    ['课组名称', '最少修读门数', '最少修读学分'],
    ['name', 'minCourses', 'minCredits']
);

export default { zhjwCourseNameMap, zhjwCourseGroupNameMap, zhjwExamNameMap, zhjwInfoNameMap };
