import type { SmsTemplate } from '../types';

export const smsTemplates: SmsTemplate[] = [
  {
    id: 'T001',
    name: '质保卡签发送达',
    content: '【{storeName}】尊敬的{customerName}，您的手机维修已完成，质保卡号{cardNo}，质保期{warrantyDays}天，有效期至{expireDate}。请点击链接查看并签署电子质保卡：{link}',
    type: 'issue',
  },
  {
    id: 'T002',
    name: '质保到期提醒',
    content: '【{storeName}】温馨提醒：尊敬的{customerName}，您的{phoneModel}手机质保卡（{cardNo}）将于{expireDate}到期，如有故障请及时申请核销。客服热线：{phone}',
    type: 'reminder',
  },
  {
    id: 'T003',
    name: '核销申请已受理',
    content: '【{storeName}】尊敬的{customerName}，您的质保核销申请已提交成功，申请编号{claimId}，我们将在24小时内完成检测，请保持电话畅通。',
    type: 'claim',
  },
  {
    id: 'T004',
    name: '核销申请通过',
    content: '【{storeName}】尊敬的{customerName}，您的质保核销申请（{claimId}）已通过审核，{solutionType}维修方案。请您携带手机于{date}前到{storeName}办理维修。地址：{address}',
    type: 'repair',
  },
  {
    id: 'T005',
    name: '核销申请拒绝',
    content: '【{storeName}】尊敬的{customerName}，很抱歉，您的质保核销申请（{claimId}）未能通过审核。原因：{rejectReason}。如有异议请致电{phone}咨询。',
    type: 'claim',
  },
  {
    id: 'T006',
    name: '维修完成通知',
    content: '【{storeName}】尊敬的{customerName}，您的{phoneModel}手机已维修完成，请您尽快到{storeName}取机。维修费用：{cost}元。地址：{address}',
    type: 'repair',
  },
  {
    id: 'T007',
    name: '售后回访邀请',
    content: '【{storeName}】尊敬的{customerName}，感谢您选择我们的服务！诚邀您参与本次服务满意度评价，点击链接参与：{link}。您的反馈对我们很重要！',
    type: 'visit',
  },
  {
    id: 'T008',
    name: '质保卡签署提醒',
    content: '【{storeName}】尊敬的{customerName}，您的电子质保卡（{cardNo}）尚未签署，请于{date}前点击链接完成签署，否则可能影响您的质保权益：{link}',
    type: 'reminder',
  },
  {
    id: 'T009',
    name: '检测进度通知',
    content: '【{storeName}】尊敬的{customerName}，您的质保核销申请（{claimId}）正在检测中，预计{hours}小时内出结果，请耐心等待。如有疑问请致电{phone}。',
    type: 'claim',
  },
  {
    id: 'T010',
    name: '异议处理通知',
    content: '【{storeName}】尊敬的{customerName}，您对核销申请（{claimId}）的异议已收到，我们将重新检测并在48小时内给予答复，请保持电话畅通。',
    type: 'claim',
  },
];

export const getTemplateById = (id: string): SmsTemplate | undefined => {
  return smsTemplates.find(t => t.id === id);
};

export const getTemplatesByType = (type: string): SmsTemplate[] => {
  return smsTemplates.filter(t => t.type === type);
};

export const getTemplateByName = (name: string): SmsTemplate | undefined => {
  return smsTemplates.find(t => t.name === name);
};

export const renderSmsTemplate = (
  templateId: string,
  variables: Record<string, string>
): string => {
  const template = smsTemplates.find(t => t.id === templateId);
  if (!template) return '';
  
  let content = template.content;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    content = content.replace(regex, variables[key]);
  });
  
  return content;
};

export const getTemplateOptions = () => {
  return smsTemplates.map(t => ({
    value: t.id,
    label: t.name,
  }));
};

export const getTemplateTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    issue: '质保签发',
    claim: '核销申请',
    repair: '维修服务',
    reminder: '提醒通知',
    visit: '回访调查',
  };
  return labels[type] || type;
};

export const getAllTemplateTypes = () => {
  return [
    { value: 'issue', label: '质保签发' },
    { value: 'claim', label: '核销申请' },
    { value: 'repair', label: '维修服务' },
    { value: 'reminder', label: '提醒通知' },
    { value: 'visit', label: '回访调查' },
  ];
};
