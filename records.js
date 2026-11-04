// Repeatable resume sections and their field matching rules.
export const recordTypes = [
  { key: 'educationEntries', title: '教育经历', addText: '新增教育经历', fields: [
    { key: 'school', label: '学校', terms: ['学校名称', '毕业院校', '就读学校', '学校', '院校', 'university', 'college', 'school'] },
    { key: 'degree', label: '学历', terms: ['最高学历', '教育程度', '学历', '学位', 'degree'] },
    { key: 'studyMode', label: '学习形式', terms: ['学习形式', '学习方式', '培养方式', '教育形式', 'study mode'] },
    { key: 'major', label: '专业', terms: ['专业', 'major'] },
    { key: 'startDate', label: '入学时间', terms: ['入学', '开始时间', '起始时间', 'start date'] },
    { key: 'endDate', label: '毕业时间', terms: ['毕业时间', '结束时间', '终止时间', 'end date'] },
    { key: 'gpa', label: '成绩（GPA）', terms: ['成绩gpa', 'gpa', '平均绩点'] },
    { key: 'rank', label: '专业排名', terms: ['专业排名', '班级排名', '排名', 'rank'] },
    { key: 'languageType', label: '语言类型', terms: ['语言类型', '语种', '语言种类'] },
    { key: 'languageLevel', label: '掌握程度', terms: ['掌握程度', '语言水平', '熟练程度', '语言能力'] },
    { key: 'description', label: '补充说明', terms: ['课程', '描述', '说明', 'description'], multiline: true }
  ] },
  { key: 'workEntries', title: '工作 / 实习经历', addText: '新增工作经历', fields: [
    { key: 'company', label: '公司', terms: ['公司名称', '单位名称', '任职公司', '公司', '单位', 'company', 'employer'] },
    { key: 'position', label: '职位', terms: ['职位名称', '岗位名称', '担任职务', '职位', '岗位', '职务', 'position', 'job title'] },
    { key: 'startDate', label: '开始时间', terms: ['开始时间', '入职时间', '起始时间', 'start date'] },
    { key: 'endDate', label: '结束时间', terms: ['结束时间', '离职时间', '终止时间', 'end date'] },
    { key: 'description', label: '工作内容', terms: ['工作内容', '工作描述', '工作职责', '实习内容', '职位描述', '职责', '描述', 'description'], multiline: true }
  ] },
  { key: 'projectEntries', title: '项目经历', addText: '新增项目经历', fields: [
    { key: 'name', label: '项目名称', terms: ['项目名称', '项目名', 'project name'] },
    { key: 'role', label: '担任角色', terms: ['担任角色', '项目角色', '项目职务', '职务', '职责', 'role'] },
    { key: 'startDate', label: '开始时间', terms: ['开始时间', '起始时间', 'start date'] },
    { key: 'endDate', label: '结束时间', terms: ['结束时间', '终止时间', 'end date'] },
    { key: 'url', label: '项目地址', terms: ['项目地址', '项目链接', 'project url', 'project link'] },
    { key: 'description', label: '项目描述', terms: ['项目描述', '项目内容', '项目介绍', '项目职责', '描述', 'description'], multiline: true }
  ] },
  { key: 'awardEntries', title: '获奖 / 证书', addText: '新增获奖 / 证书', fields: [
    { key: 'name', label: '名称', terms: ['奖项名称', '证书名称', '荣誉名称', 'award', 'certificate'] },
    { key: 'date', label: '获得时间', terms: ['获奖时间', '获得时间', '颁发时间', 'date'] },
    { key: 'description', label: '补充说明', terms: ['说明', '描述', 'description'], multiline: true }
  ] },
  { key: 'campusEntries', title: '在校职务', addText: '新增在校职务', fields: [
    { key: 'role', label: '职务名称', terms: ['职务名称', '职务', '职位名称', 'position', 'role'] },
    { key: 'startDate', label: '开始时间', terms: ['开始时间', '起始时间', 'start date'] },
    { key: 'endDate', label: '结束时间', terms: ['结束时间', '终止时间', 'end date'] },
    { key: 'description', label: '职务描述', terms: ['职务描述', '工作描述', '描述', 'description'], multiline: true }
  ] }
];
