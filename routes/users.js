var express = require('express');
var router = express.Router();
var Admin = require('./adminsSchema');
var Student = require('./studentsSchema');

// 身份标识
var identity = []
// 用户名称
var name = ''
// 用户id
var user_id = ''
// 用户部门
var apartment = ''

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource!');
});

router.post('/login', function (req, res, next) {

  // console.log(req.body);{ username: 'admin', password: '123456', identity: 'admin' }

  // 保存用户的id
  user_id = req.body.username

  if (req.body.identity == 'admin') {
    identity = ['admin']
    // 利用req.body的内容查到对应的帐号的身份  决定返回不同的token
    Admin.find({
      'admin_number': req.body.username
    }, (err, docs) => {
      if (err) {
        console.log(err);
        return;
      }
      // 判断输入密码是否正确
      let content = {
        code: 20000,
        data: {
          token: 'admin-token'
        }
      }
      // 如果密码不对则改变返回的code
      if (req.body.password !== docs[0].admin_password) {
        content.code = 10000
      }

      // 保存管理者名称
      name = docs[0].admin_name
      // 保存管理者部门
      apartment = docs[0].apartment

      res.send(content);
    })
  } else if (req.body.identity == 'editor') {
    identity = ['editor']
    // 若身份是editor
    // 判断输入密码是否正确
    Student.find({
      'stu_number': req.body.username
    }, (err, docs) => {
      if (err) {
        console.log(err);
        return;
      }
      // 判断输入密码是否正确
      let content = {
        code: 20000,
        data: {
          token: 'admin-token'
        }
      }
      // 如果密码不对则改变返回的code
      if (req.body.password !== docs[0].stu_password) {
        content.code = 10000
      }

      // 保存学生名称
      name = docs[0].stu_name

      res.send(content);
    })


    // let content = {
    //   code: 20000,
    //   data: {
    //     token: 'admin-token'
    //   }
    // }
    // 如果密码不对则改变返回的code
    // if (req.body.password !== docs[0].admin_password) {
    //   content.code = 10000
    // }
    // res.send(content);
  } else if (req.body.identity == 'superAdmin') {
    identity = ['superAdmin']
  }

});


router.get('/info', function (req, res, next) {
  // console.log(req.query.token);
  // req.query是请求带过来的参数
  // req 是前端返回的token  state.token   也是login后端返回的data.token  可以拿来做判断决定返回roles的类型
  let info = {
    // roles: ['editor'],
    // roles: ['admin'],
    roles: identity,
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: name,
    user_id: user_id,
    apartment: apartment
  }
  let content = {
    code: 20000,
    data: info
  }
  res.send(content);
});

router.post('/logout', function (req, res, next) {
  let content = {
    code: 20000,
    data: 'success'
  }
  res.send(content);
});

module.exports = router;