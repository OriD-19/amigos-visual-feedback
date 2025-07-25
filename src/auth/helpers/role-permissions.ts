export const RolePermissions = {
  admin: [
    'createProduct',
    'assignProductToStore',
    'manageUsers',
    'createUser',
    'updateUser',
    'deleteUser',
    'viewUser',
    'viewProduct',
    'viewStore',
    'createStore',
  ],
  manager: [
    'createProduct',
    'assignProductToStore',
  ],
  cliente: [
    'viewProduct',
    'createFeedback',
  ],
}; 