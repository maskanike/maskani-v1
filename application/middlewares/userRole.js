// To be added on routes as such checkRole('admin'). This way only admins can access that route
export default (requiredRole) => (req, res, next) => {
  if (req.currentUser.role === requiredRole) {
    return next();
  }
  return res.status(401).send('Action not allowed');
};
