export function isAdmin(user) {
  return (
    user?.role_id === 1 ||
    user?.role?.name?.toLowerCase() === 'admin' ||
    user?.role === 'admin'
  );
}
