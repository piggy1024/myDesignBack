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
var ClassroomSchema = mongoose.Schema({
    classroomName: String,
    building: String,
    isUsed: Boolean,
    isMultimedia: Boolean,
    size: String
})

// 定义数据库模型 来操作数据库
var Classroom = mongoose.model('Classroom', ClassroomSchema);


router.get('/', function (req, res, next) {
    res.send('respond with a resource! classrooms!');
});
router.get('/list', function (req, res, next) {
    Classroom.find({}, async (err, doc) => {
        if (err) {
            console.log(err);
            return;
        }

        res.send({
            code: 20000,
            data: doc
        });
    })

});
module.exports = router;