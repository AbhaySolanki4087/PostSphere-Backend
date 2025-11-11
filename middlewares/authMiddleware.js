// // middlewares/authMiddleware.js

// function isLoggedIn(req, res, next) {
//   if (!req.session?.user) {
//     req.session = req.session || {};
//     req.session.user = {name:'abhay'};
//   }

//   //if still no user
//   if(!req.session.user){
    
//     return res.status(401).json({ success: false, message: 'Unauthorized' });
//   } 
//   req.user = req.session.user;
//   next();
  
// }

// module.exports = { isLoggedIn };
// middlewares/authMiddleware.js
module.exports = function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
