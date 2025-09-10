class Service {

    constructor(conf, req, res) {
        this.conf = conf;
        this.req = req;
        this.res = res;
    }

    handleResponse(resp, stat) {
        return this.res.status(stat).send(resp);
    }

    handleMongoError(err) {
        if (err.name === 'ValidationError') {
            console.error('Validation failed:', err.message);
            return this.res.status(400).send({ error: err.message })
        } else if (err.code === 11000) {
            console.error('Duplicate key error:', err.message);
            return this.res.status(409).send({ error: err.message })
        } else {
            console.error('Internal server error:', err);
            return this.res.status(500).send({ error: "Internal server error" })
        }
    }

}

module.exports = Service;