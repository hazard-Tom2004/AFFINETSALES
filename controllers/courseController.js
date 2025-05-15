const Course = require("../models/course");

exports.createCourse = async (req, res) => {
  const { video_url, title, thumbnail, author } = req.body;
  console.log(req.body);
  if (!video_url || !title || !thumbnail || !author) {
    return res
      .status(400)
      .send({ success: false, msg: "Please fill all the fields" });
  }
  try {
    await Course.create(title, video_url, thumbnail, author);
    return res
      .status(201)
      .send({ success: true, msg: "Course created successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ success: false, msg: "Internal Server Error" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const result = await Course.getAll();
    return res
      .status(201)
      .send({
        success: true,
        msg: "Courses fetched successfully",
        data: result,
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ success: false, msg: "Internal Server Error" });
  }
};
