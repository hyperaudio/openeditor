import { API } from 'aws-amplify';
import moize from 'moize';
import uuidv5 from 'uuid/v5';
import uuidv4 from 'uuid/v4';
import bs58 from 'bs58';

moize.collectStats();

export const computeId = (name, namespace) => {
  const buffer = new Buffer(16);
  uuidv5(name, Array.from(bs58.decode(namespace)), buffer);
  return bs58.encode(buffer);
};

export const generateId = () => {
  const buffer = new Buffer(16);
  uuidv4(null, buffer);
  return bs58.encode(buffer);
};

export const validateId = id => {
  try {
    Array.from(bs58.decode(id));
  } catch (e) {
    return false;
  }
  return true;
};

export const GET = (path, options = {}) => API.get('ApiGatewayRestApi', path, options);
export const POST = (path, options = {}) => API.post('ApiGatewayRestApi', path, options);
export const PUT = (path, options = {}) => API.put('ApiGatewayRestApi', path, options);

export const mGET = moize(GET, {
  isPromise: true,
  isDeepEqual: true,
  maxAge: 1000 * 60 * 5, // 5 minutes
  updateExpire: true,
});

export const clearCache = () => mGET.clear();
export const cacheStats = () => console.log('cache', mGET.getStats());

// CRUD
// CREATE
// FIXME new API
export const newUpload = (PK, title, parent, src) => {
  const body = {
    SK: 'v0_metadata',
    RowType: 'transcript',
    parent,
    title,
    src,
    status: 'uploaded',
  };

  if (validateId(PK)) body.PK = PK;
  return POST('/data', { body });
};

export const triggerTranscription = (PK, storageBucket, key, extension, fileUri, download = false) =>
  POST('/transcribe', {
    body: {
      PK,
      storageBucket,
      key,
      extension,
      fileUri,
      download,
    },
  });

export const triggerAlignment = PK => POST('/align', { body: { PK } });
window.triggerAlignment = triggerAlignment;

export const triggerTranscoding = (PK, fileUri) => POST('/transcode', { body: { PK, fileUri } });
// window.triggerTranscoding = triggerTranscoding;

export const newFolder = (title, parent) =>
  POST('/data', {
    body: {
      SK: 'v0_metadata',
      RowType: 'folder',
      parent,
      title,
    },
  });

export const newProject = async (title, user) => {
  const {
    data: { PK },
  } = await POST('/data', {
    body: {
      SK: 'v0_metadata',
      RowType: 'project',
      title,
    },
  });

  await joinProject(PK, user);

  return PK;
};

export const add2Project = (project, user) =>
  POST(`/user/${user}/projects`, {
    body: { project },
  });

export const joinProject = (project, user) => POST(`/users/${user}/projects`, { body: { project } });
export const leaveProject = (project, user) => POST(`/users/${user}/projects/${project}`, { body: { project } });

// READ
export const getProjects = async user => {
  // const { data = [] } = await GET(`/user/${user}/projects`);

  const { data: data2 } = await GET(`/users/${user}/projects`);

  // const projects = Object.entries(
  //   [...data, ...data2.map(({ PK: id, title }) => ({ id, title }))].reduce(
  //     (acc, { id, title }) => ({ ...acc, [id]: title }),
  //     {}
  //   )
  // )
  //   .map(([id, title]) => ({ id, title }))
  //   .filter(({ title }) => !!title);
  // console.log(data, data2, projects);
  const projects = data2.map(({ Item: { PK: id, title } }) => ({ id, title }));
  // console.log({ projects });

  return projects;
};

export const getUsers = async () => {
  const { data } = await GET(`/users`);

  return data;

  // return users.map(({ Attributes }) =>
  //   Attributes.reduce((acc, { Name, Value }) => {
  //     acc[Name] = Value;
  //     return acc;
  //   }, {})
  // );
};

export const projectUsers = project => GET(`/projects/${project}`);

// export const getProjects = async user => {
//   const {
//     data: { projects = [] },
//   } = await mGET(`/data/${user}/v0_projects`);

//   // magic default project
//   if (!projects.includes('WSfgTYHNC4KWP99jKZFdvR')) projects.push('WSfgTYHNC4KWP99jKZFdvR');

//   return (await Promise.all(projects.map(p => mGET(`/data/${p}/v0_metadata`)))).map(
//     ({ data: { PK: id, abbr, title, color, backgroundColor } }) => ({
//       id,
//       abbr,
//       title,
//       style: { color, backgroundColor },
//     })
//   );
// };

export const getTree = parent => GET(`/tree/${parent}`);

// export const getTree = async parent => {
//   const { data = [] } = await GET(`/tree/${parent}`);

//   const translate = item => {
//     return {
//       ...item,
//       key: item.PK,
//       value: item.PK,
//       ...(item.children && { children: item.children.map(child => translate(child)) }),
//     };
//   };

//   const root = {
//     ...translate(data),
//     title: await getTitle(parent),
//   };

//   return [root];
// };

export const getItems = async (project, parent) => {
  if (!project || !parent) return [];

  const { data = [] } = await GET(`/children/${parent}`);

  // console.log(await GET(`/breadcrumbs/${parent}`));
  // console.log(await GET(`/tree/${parent}`));

  return data.map(
    ({
      PK,
      title,
      updatedAt,
      updatedBy,
      createdAt,
      createdBy,
      RowType,
      status = 'folder',
      duration = 0,
      count = 0,
      message,
    }) => ({
      key: PK,
      title,
      updatedBy,
      updatedAt,
      createdAt,
      createdBy,
      duration,
      count,
      status,
      message,
      type: RowType,
    })
  );
};

export const getPath = async (project, parent) => {
  let { data: p } = await getItem(parent);
  const path = [p];

  while (p.parent) {
    p = (await getItem(p.parent)).data;
    path.push(p);
  }

  path.pop();

  return path.reverse();
};

// FIXME new API
export const getItem = id => mGET(`/data/${id}/v0_metadata`);

export const getTranscript = id => GET(`/transcript/${id}`);

// FIXME new API
export const getTitle = async id => {
  if (!id || id === 'undefined') return ' '; // FIXME
  const {
    data: { title },
  } = await getItem(id);
  return title;
};

// FIXME new API
export const getSrc = async (id, parent) => {
  const {
    data: { src },
  } = await getItem(id, parent);
  return src;
};

export const getUser = user => mGET(`/users/${user}`);

export const getUserName = async user => {
  const {
    data: { name },
  } = await getUser(user);

  return name;
};

// UPDATE
export const updateTranscript = (id, blocks, changes) => {
  clearCache();
  return PUT(`/transcript/${id}`, { body: { blocks, changes } });
};

export const duplicateTranscript = id => {
  clearCache();
  return POST(`/transcript/${id}`, { body: {} });
};
window.duplicateTranscript = duplicateTranscript;

export const reparagraphTranscript = id => {
  clearCache();
  return POST(`/reparagraph/${id}`, { body: {} });
};
window.reparagraphTranscript = reparagraphTranscript;

// export const recomputeFolder = id => {
//   clearCache();
//   return POST(`/recompute/${id}`, { body: {} });
// };
// // window.recomputeFolder = recomputeFolder;

// FIXME new API
export const updateAttributes = async (id, attributes) => {
  clearCache();
  const { data } = await getItem(id);
  delete data.count;

  return PUT(`/data/${id}/v0_metadata`, {
    body: { ...data, ...attributes },
  });
};

// FIXME new API
export const versionedUpdateAttributes = async (id, attributes) => {
  alert('disabled');
  // clearCache();
  // const {
  //   data,
  //   data: { RowVersion },
  // } = await getItem(id);

  // // create v+1
  // const { data: item } = await POST('/data', {
  //   body: {
  //     ...data,
  //     SK: `v${RowVersion + 1}_metadata`,
  //     RowVersion: RowVersion + 1,
  //     ...attributes,
  //   },
  // });

  // // update v0
  // return PUT(`/data/${id}/v0_metadata`, {
  //   body: {
  //     ...item,
  //     ...attributes,
  //     SK: `v0_parent:${parent}`,
  //   },
  // });
};

// FIXME new API
// export const updateTitle = (id, parent, title) => versionedUpdateAttributes(id, parent, { title });
export const updateTitle = (id, title) => updateAttributes(id, { title });

// export const updateTranscript = () => {};

// FIXME new API
export const moveToFolder = (id, folder) => updateAttributes(id, { parent: folder });
// export const moveToFolder = async (id, parent, folder) => {
//   clearCache();
//   const { data } = await getItem(id, parent);

//   await POST('/data', {
//     body: { ...data, SK: `v0_metadata` },
//   });

//   return await updateAttributes(id, parent, { deleted: true });
// };

// FIXME new API
export const moveToArchive = (id, project) => moveToFolder(id, computeId('ARCHIVE', project));
// FIXME new API
export const moveToTrash = (id, project) => moveToFolder(id, computeId('TRASH', project));

// export const addUserToProject = () => {};
// export const removeUserFromProject = () => {};

// DELETE
// n/a

// export const getUserName = sub => API.get('ApiGatewayRestApi', `/user/${sub}`);

// export const memoizedUserName = moize(getUserName, { isPromise: true });

// export const createNewFolder = async (title, parent) => {
//   const response = await API.post('ApiGatewayRestApi', '/data', {
//     body: {
//       SK: `v0_parent:${parent}`,
//       RowType: 'folder',
//       title,
//     },
//   });
//   console.log(response);

//   return response;
// };

// move, delete, archive
// rename

// FIXME: move to docs?

// const groups = (await Auth.currentSession()).accessToken.payload['cognito:groups'] || [];
// this.setState({
//   projects: [
//     ...this.state.projects,
//     ...groups.map(name => ({
//       name,
//       style: { color: '#f56a00', backgroundColor: '#ddddcf' },
//     })),
//   ],
// });

//
// WSfgTYHNC4KWP99jKZFdvR

// ad223c12-145f-4284-a586-74b19cde94d5

// const response = await API.post('ApiGatewayRestApi', '/data', {
//   body: {
//     PK: username,
//     SK: 'v0_projects',
//     RowType: 'projects',
//     projects: ['WSfgTYHNC4KWP99jKZFdvR'],
//   },
// });
// console.log(response);

// const response = await API.post('ApiGatewayRestApi', '/data', {
//   body: {
//     PK: 'WSfgTYHNC4KWP99jKZFdvR',
//     SK: 'v0_metadata',
//     RowType: 'project',

//     abbr: 'ST',
//     title: 'STRA',
//     color: '#f56a00',
//     backgroundColor: '#ddddcf',
//   },
// });
// console.log(response);

//

// const response = await API.post('ApiGatewayRestApi', '/data', {
//   body: {
//     PK: 'AvzxE5ffDWWBF3TG66MWMv',
//     SK: 'v0_parent:WSfgTYHNC4KWP99jKZFdvR',
//     RowType: 'folder',
//     title: 'Folder B',
//   },
// });
// console.log(response);

// const response = await API.post('ApiGatewayRestApi', '/data', {
//   body: {
//     PK: 'N8AZiQm3rPK8LNtrmexaiT',
//     SK: 'v0_parent:WSfgTYHNC4KWP99jKZFdvR',
//     RowType: 'file',
//     title: 'Simone De Beauvoir Part 2',
//     duration: 3600000,
//     status: 'aligning',
//   },
// });
// console.log(response);

// assume current project is 1st
// const project = projects[0];
// const items = await API.get('ApiGatewayRestApi', `/data`, {
//   queryStringParameters: {
//     IndexName: 'SK-index',
//     SK: `v0_parent:${project.PK}`,
//     PK: null,
//   },
// });
// console.log(`project ${project.title} root items`, items);

// // polulate root items
// this.setState({
//   data: [
//     ...items.data.map(
//       ({ PK, title, updatedAt, updatedBy, createdAt, createdBy, RowType, status = 'folder', duration = '--' }) => ({
//         key: PK,
//         title,
//         user: updatedBy,
//         edited: updatedAt,
//         added: createdAt,
//         duration,
//         status,
//         type: RowType,
//       })
//     ),
//     ...this.state.data,
//   ],
// });

// const projects = [
//   'A7MnRK4jcagRkmJ9pxLn8g',
//   '3EetqhQ1fM4iR7xeQtDmov',
//   'FeKdpfX29sLhjruCwPp4jG',
//   'Nxa5Ht276wMg1zgqaTPk33',
//   'AcQD8t1tKZV66adjSjhDaY',
//   'CcmKZmRdTctmsWjQ51gk9Y',
//   'WSfgTYHNC4KWP99jKZFdvR',
// ];

// const users = [
//   '89d6161e-7e0d-4a65-a640-d8760254d92d',
//   '6e18401b-1109-4ddd-9d27-e1d7f9a639fa',
//   '07a2730f-000e-4518-8d37-523c9f584c38',
//   '6da2f0ec-57ac-4879-8224-f99905983b0a',
//   'e86fd409-77a8-4312-9e2d-909fdec8a344',
//   '2d5a9744-e3cc-4750-ac0a-59a4f31c5a5a',
//   '99827d27-dca3-406f-a5b5-79dd8a2741c2',
//   '7b8a7590-5b87-4a24-b8f4-b2c933882417',
//   '9c248a67-56fc-4eda-994c-cb24ed963198',
//   '291d75ce-28d4-4625-861a-4b3cd8de5ade',
//   '15d626d9-16e6-415e-95e2-8df24efb95d7',
//   '885351bb-2e1a-473d-ab87-26c5ab5f83ef',
//   '26eed2e6-0815-4d24-b443-1507b0b56313',
//   '1cb8a574-26e2-425d-b6fc-2dc609239aa0',
//   '05b53e72-c1c2-4335-8dc6-448d12bbb82a',
//   'db6b4f44-2499-4c92-a3ea-71f5c043283d',
// ];

// const BOOM = async () => {
//   // const data = await Promise.all(users.map(user => GET(`/user/${user}/projects`)));
//   // console.log(data);

//   users.forEach(async user => {
//     const { data } = await GET(`/user/${user}/projects`);
//     for
//   });

// };
// window.BOOM = BOOM;
