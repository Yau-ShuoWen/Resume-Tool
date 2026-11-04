// Repeatable resume sections and their field matching rules.
export const recordTypes = [
  { key: 'educationEntries', title: '教育经历', addText: '新增教育经历', fields: [
    { key: 'school', label: '学校', terms: ['学校', '院校', 'university', 'college', 'school'] },
    { key: 'degree', label: '学历', terms: ['学历', '学位', 'degree'] },
    { key: 'major', label: '专业', terms: ['专业', 'major'] },
    { key: 'startDate', label: '入学时间', terms: ['入学', '开始时间', '起始时间', 'start date'] },
    { key: 'endDate', label: '毕业时间', terms: ['毕业时间', '结束时间', '终止时间', 'end date'] },
    { key: 'description', label: '补充说明', terms: ['课程', '描述', '说明', 'description'], multiline: true }
  ] },
  { key: 'workEntries', title: '工作 / 实习经历', addText: '新增工作经历', fields: [
    { key: 'company', label: '公司', terms: ['公司', '单位', 'company', 'employer'] },
    { key: 'position', label: '职位', terms: ['职位', '岗位', '职务', 'position', 'job title'] },
    { key: 'startDate', label: '开始时间', terms: ['开始时间', '入职时间', '起始时间', 'start date'] },
    { key: 'endDate', label: '结束时间', terms: ['结束时间', '离职时间', '终止时间', 'end date'] },
    { key: 'description', label: '工作内容', terms: ['工作内容', '工作描述', '职责', '实习内容', 'description'], multiline: true }
  ] },
  { key: 'projectEntries', title: '项目经历', addText: '新增项目经历', fields: [
    { key: 'name', label: '项目名称', terms: ['项目名称', '项目名', 'project name'] },
    { key: 'role', label: '担任角色', terms: ['担任角色', '项目角色', '职责', 'role'] },
    { key: 'startDate', label: '开始时间', terms: ['开始时间', '起始时间', 'start date'] },
    { key: 'endDate', label: '结束时间', terms: ['结束时间', '终止时间', 'end date'] },
    { key: 'url', label: '项目地址', terms: ['项目地址', '项目链接', 'project url', 'project link'] },
    { key: 'description', label: '项目描述', terms: ['项目描述', '项目内容', '项目介绍', 'description'], multiline: true }
  ] },
  { key: 'awardEntries', title: '获奖 / 证书', addText: '新增获奖 / 证书', fields: [
    { key: 'name', label: '名称', terms: ['奖项名称', '证书名称', '荣誉名称', 'award', 'certificate'] },
    { key: 'date', label: '获得时间', terms: ['获奖时间', '获得时间', '颁发时间', 'date'] },
    { key: 'description', label: '补充说明', terms: ['说明', '描述', 'description'], multiline: true }
  ] }
];
