var mongoose = require('mongoose');

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
var ApplicationPostSchema = mongoose.Schema({
    // _id: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: Status
    // },
    app_theme: String, // 主题
    stu_id: String, // 申请人工号或者学号
    app_name: String, // 申请人名称
    app_phone: String, // 申请人电话
    app_type: String, // 活动类型
    app_post_type: String, // 宣传品类型
    applicant: String, // 申请单位
    app_start_time: Date, // 申请开始使用时间
    app_end_time: Date, // 申请结束使用时间
    app_content: String, // 活动内容
    app_passTime: String, // 申请通过时间
    status: { // 通过状态
        type: Number,
        default: 0
    },
    reason: String // 审批理由
})

// 定义数据库模型 来操作数据库
var PostApplication = mongoose.model('hang_post_application', ApplicationPostSchema);

module.exports = PostApplication;