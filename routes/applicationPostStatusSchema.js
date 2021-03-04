var mongoose = require('mongoose');
var PostApplication = require('./applicationPostSchema');
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
var statusPostSchema = mongoose.Schema({
    app_id: {
        type: String,
        ref: PostApplication // ref后的PostApplication代表的是主表PostApplication的Model。
    },
    department_status: {
        type: String,
        default: '0'
    },
    department_reason: {
        type: String,
        default: ''
    },
    propagandaDepartment_status: {
        type: String,
        default: '0'
    },
    propagandaDepartment_reason: {
        type: String,
        default: ''
    },
    stu_status_id: {
        type: String,
        default: ''
    }
})

// 定义数据库模型 来操作数据库
var PostStatus = mongoose.model('hang_post_applications_statu', statusPostSchema);

module.exports = PostStatus;