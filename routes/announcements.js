var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();


// 建立数据库连接
mongoose.connect('mongodb://127.0.0.1:27017/applySystem', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("数据库连接成功");

});

//  定义一个schema  对象的字段应该与数据库表一一对应
var AnnouncementSchema = mongoose.Schema({
    theme: String,
    content: String,
    publisher: String,
    publishTime: {
        type: Date,
        default: new Date()
    },
    isPublish: Boolean,
    phone: String,
    remark: String
})

// 定义数据库模型 来操作数据库
var Announcement = mongoose.model('Announcement', AnnouncementSchema);


router.get('/', function (req, res, next) {
    res.send('respond with a resource! Announcement');
});
// 公告列表
router.get('/list', function (req, res, next) {
    let searchForm = {}
    // 若查询条件不为空
    if (req.query.publisher) {
        searchForm.publisher = req.query.publisher
    }
    Announcement.find(searchForm, async (err, doc) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send({
            code: 20000,
            data: doc.reverse()
        });
    })

});

// 查找公告
router.post('/findAnnouncement', function (req, res, next) {
    Announcement.findById({
        '_id': req.query.id
    }, (err, docs) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send({
            code: 20000,
            data: docs.reverse()
        })
    })

})

// 增加公告 或者 编辑公告
router.post('/addAnnouncement', function (req, res, next) {
    // req.query 请求传过的对象
    // 操作数据库Announcements集合新增一条数据或修改一条数据


    // 若传过的id为空,则新增
    if (!req.query._id) {
        // 删掉属性_id才能新增成功
        delete req.query._id
        Announcement.create(req.query, err => {
            console.log(err);
        })
        res.send({
            code: 20000,
            msg: '新增成功!'
        })
    } else {
        // 带id过来就修改
        Announcement.updateOne({
            '_id': req.query._id
        }, req.query, (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(response);
            res.send({
                code: 20000,
                data: {
                    msg: '编辑修改成功!'
                }
            })
        })
    }

})

// 删除公告
router.post('/deleteAnnouncement', function (req, res, next) {
    // 操作数据库删除操作
    Announcement.deleteOne({
            '_id': req.query.id
        }, //查找条件
        /*回调函数*/
        (err, docs) => {
            if (err) {
                return console.log('删除数据失败')
            }
            console.log(docs);
        })
    res.send({
        code: 20000,
        msg: '删除成功!'
    })
})

router.get('/reset', function (req, res, next) {
    let admin_number = req.query.admin_number;
    let admin_new_password = req.query.admin_new_password;
    console.log(admin_number);
    console.log(admin_new_password);

    Announcement.update({
        'theme': '放假通知'
    }, {
        'content': '!!10月1日-10月9号放假,不会进行审批管理'
    }, (err, response) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(response);

    })
    res.send({
        code: 20000,
        data: {
            msg: '重置密码成功!'
        }
    })
})
module.exports = router;