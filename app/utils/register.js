export default cb => {
  const now = new Date();
  if (now < Date("Sun Sep 19 2018 21:17:08 GMT+0800 (中国标准时间)")) {
    cb();
  }
};


