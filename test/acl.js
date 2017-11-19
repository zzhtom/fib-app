const test = require('test');
test.setup();

const http = require('http');

describe("acl", () => {
    describe("basic", () => {
        var id;

        it("forbidden", () => {
            var rep = http.post('http://127.0.0.1:8080/1.0/app/test_acl', {
                json: {
                    name: "aaa",
                    age: 12,
                    sex: "female"
                }
            });
            assert.equal(rep.statusCode, 403);
        });

        it("role allow act", () => {
            http.post('http://127.0.0.1:8080/set_session', {
                json: {
                    id: 12345,
                    roles: ['r2']
                }
            });

            var rep = http.post('http://127.0.0.1:8080/1.0/app/test_acl', {
                json: {
                    name: "aaa",
                    age: 12,
                    sex: "female"
                }
            });
            assert.equal(rep.statusCode, 201);
            id = rep.json().id;
        });

        it("object act", () => {
            http.post('http://127.0.0.1:8080/set_session', {
                json: {
                    id: 12345
                }
            });

            var rep = http.get(`http://127.0.0.1:8080/1.0/app/test_acl/${id}`);
            assert.equal(rep.statusCode, 403);

            http.post('http://127.0.0.1:8080/set_session', {
                json: {
                    id: 54321
                }
            });

            var rep = http.get(`http://127.0.0.1:8080/1.0/app/test_acl/${id}`);
            assert.equal(rep.statusCode, 200);
        });

        it("role allow all", () => {
            http.post('http://127.0.0.1:8080/set_session', {
                json: {
                    id: 12345,
                    roles: ['r2']
                }
            });

            var rep = http.post('http://127.0.0.1:8080/1.0/app/test_acl', {
                json: {
                    name: "aaa",
                    age: 12,
                    sex: "female"
                }
            });
            assert.equal(rep.statusCode, 201);
            var res = rep.json();
        });

        it("object allow owner", () => {
            http.post('http://127.0.0.1:8080/set_session', {
                json: {
                    id: 12345,
                    roles: ['r2']
                }
            });

            var rep = http.post('http://127.0.0.1:8080/1.0/app/test_acl', {
                json: {
                    name: "aaa",
                    age: 12,
                    sex: "female"
                }
            });
            assert.equal(rep.statusCode, 201);
            var res = rep.json();

            http.post('http://127.0.0.1:8080/set_session', {
                json: {
                    id: 12346
                }
            });

            var rep = http.get(`http://127.0.0.1:8080/1.0/app/test_acl/${res.id}`);
            assert.equal(rep.statusCode, 403);
        });

        it("user disallow", () => {
            http.post('http://127.0.0.1:8080/set_session', {
                json: {
                    id: 9999,
                    roles: ['r1']
                }
            });

            var rep = http.post('http://127.0.0.1:8080/1.0/app/test_acl', {
                json: {
                    name: "aaa",
                    age: 12,
                    sex: "female"
                }
            });
            assert.equal(rep.statusCode, 403);
        });

        describe("allow field", () => {
            before(() => {
                http.post('http://127.0.0.1:8080/set_session', {
                    json: {
                        id: 123,
                        roles: ['r3']
                    }
                });
            });

            it("create", () => {
                var rep = http.post('http://127.0.0.1:8080/1.0/app/test_acl', {
                    json: {
                        name: "aaa",
                        age: 12,
                        sex: "female"
                    }
                });

                var id = rep.json().id;

                var rep = http.get(`http://127.0.0.1:8080/1.0/app/test_acl/${id}`);
                assert.deepEqual(rep.json(), {
                    name: "aaa",
                    age: null
                });
            });

            it("get", () => {
                var rep = http.get(`http://127.0.0.1:8080/1.0/app/test_acl/${id}`);
                assert.deepEqual(rep.json(), {
                    name: "aaa",
                    age: 12
                });

                var rep = http.get(`http://127.0.0.1:8080/1.0/app/test_acl/${id}`, {
                    query: {
                        keys: 'name,sex'
                    }
                });
                assert.deepEqual(rep.json(), {
                    name: "aaa"
                });
            });

            it("update", () => {
                var rep = http.put(`http://127.0.0.1:8080/1.0/app/test_acl/${id}`, {
                    json: {
                        name: "bbb",
                        age: 123,
                        sex: "male"
                    }
                });

                var rep = http.get(`http://127.0.0.1:8080/1.0/app/test_acl/${id}`);
                assert.deepEqual(rep.json(), {
                    name: "aaa",
                    age: 123
                });

            });

            it("find", () => {
                var rep = http.get(`http://127.0.0.1:8080/1.0/app/test_acl`, {
                    query: {
                        limit: 2
                    }
                });
                assert.deepEqual(rep.json(), [{
                        name: "aaa",
                        age: 123
                    },
                    {
                        name: "aaa",
                        age: 12
                    }
                ]);
            });
        });
    });

    describe("extend", () => {

    });
});