class ApiFeatures {
  constructor(model, reqquery) {
    this.reqquery = reqquery;
    this.query = model;
  }

  filter() {
    const excludepage = ['sort', 'page', 'limit', 'fields'];
    const copyquery = { ...this.reqquery };
    excludepage.forEach(element => {
      delete copyquery[element];
    });
    //operating
    let querystr = JSON.stringify(copyquery);
    querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(querystr)); //mongose object

    return this;
  }

  limitFields() {
    if (this.reqquery.fields) {
      const selectedfield = this.reqquery.fields.split(',').join(' ');
      this.query = this.query.select(selectedfield);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.reqquery.page * 1 || 1;
    const limit = this.reqquery.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  sort() {
    if (this.reqquery.sort) {
      this.query = this.query.sort(this.reqquery.sort.split(',').join(' '));
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
}
module.exports = ApiFeatures;
