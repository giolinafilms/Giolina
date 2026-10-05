// One configurable stage catalog shared by server validation and Admin metadata.
// Retain existing stored labels; future migrations may consolidate them explicitly.
export const projectStages=['New Inquiry','Inquiry','Lead','Follow-up','Consultation','Proposal','Proposal Sent','Proposal Signed','Contract','Deposit / Payment Schedule','Retainer Paid','Booked','Planning','Pre-Event','Event','Post-Production','Delivery','Completed'];

export const businessLifecycle=['Lead','Active','Finished','Archived'];
export function lifecycleOf(row,kind='projects'){return row.archived?'Archived':row.lifecycle||(['Completed','Lost / Declined'].includes(row.status)?'Finished':kind==='leads'&&!row.projectId?'Lead':'Active');}
