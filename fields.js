// Keys and matching terms are maintained here, not entered by the user.
export const fields = [
  { key: 'name', label: '姓名', terms: ['姓名', '真实姓名', '应聘者姓名', 'name', 'full name'] },
  { key: 'gender', label: '性别', terms: ['性别', 'gender', 'sex'] },
  { key: 'birthDate', label: '出生日期', terms: ['出生日期', '出生年月', '生日', 'date of birth', 'birthdate'] },
  { key: 'phone', label: '手机号', terms: ['手机号', '手机号码', '联系电话', '移动电话', 'phone', 'mobile', 'tel'] },
  { key: 'email', label: '邮箱', terms: ['电子邮箱', '邮箱', '电子邮件', 'email', 'e-mail'] },
  { key: 'city', label: '所在城市', terms: ['所在城市', '现居城市', '居住城市', '城市', 'city', 'location'] },
  { key: 'address', label: '详细地址', terms: ['详细地址', '居住地址', '联系地址', 'address'] },
  { key: 'school', label: '毕业院校', terms: ['毕业院校', '学校名称', '毕业学校', '就读学校', 'university', 'college', 'school'] },
  { key: 'degree', label: '学历', terms: ['最高学历', '学历', '学位', 'degree', 'education level'] },
  { key: 'major', label: '专业', terms: ['所学专业', '专业名称', '专业', 'major', 'specialty'] },
  { key: 'graduationDate', label: '毕业时间', terms: ['毕业时间', '毕业日期', '毕业年份', 'graduation date', 'graduation year'] },
  { key: 'workYears', label: '工作年限', terms: ['工作年限', '工作经验年限', 'years of experience', 'work experience years'] },
  { key: 'company', label: '最近任职公司', terms: ['最近任职公司', '上一家公司', '最近公司', 'current company', 'last company'] },
  { key: 'position', label: '最近职位', terms: ['最近职位', '上一份职位', '当前职位', 'current position', 'last position'] },
  { key: 'targetPosition', label: '目标岗位', terms: ['应聘职位', '目标岗位', '意向职位', '申请岗位', 'desired position', 'applied position', 'job title'] },
  { key: 'salary', label: '期望薪资', terms: ['期望薪资', '期望薪酬', '薪资要求', 'expected salary'] },
  { key: 'website', label: '个人网站', terms: ['个人网站', '作品链接', '作品集链接', 'portfolio', 'personal website'] },
  { key: 'github', label: 'GitHub', terms: ['github', '代码仓库'] },
  { key: 'linkedin', label: 'LinkedIn', terms: ['linkedin', '领英'] },
  { key: 'summary', label: '个人简介', terms: ['个人简介', '自我介绍', '自我评价', '个人优势', 'summary', 'about me', 'profile'] },
  { key: 'skills', label: '技能', terms: ['专业技能', '技能特长', '技能', 'skills'] },
  { key: 'resumeFile', label: '简历文件', terms: ['简历附件', '上传简历', '简历文件', 'resume', 'cv', 'upload resume'], file: true },
  { key: 'coverLetterFile', label: '求职信文件', terms: ['求职信附件', '上传求职信', 'cover letter'], file: true }
];

export const groups = [
  { title: '基本信息', keys: ['name', 'gender', 'birthDate', 'phone', 'email', 'city', 'address'] },
  { title: '教育与工作', keys: ['school', 'degree', 'major', 'graduationDate', 'workYears', 'company', 'position', 'targetPosition', 'salary'] },
  { title: '链接', keys: ['website', 'github', 'linkedin'] },
  { title: '其他内容', keys: ['summary', 'skills'] },
  { title: '附件', keys: ['resumeFile', 'coverLetterFile'] }
];
