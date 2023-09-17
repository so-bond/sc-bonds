describe("Register (Bond Issuance)", function () {
  describe("status lifecyle", function () {
    it("should be draft after deploy", async () => {});
    it("should still be Draft after mint as mint does not affect lifecyle (not process related)", async () => {});
    it("should be ready after makeReady", async () => {});
    it("should be revert to Draft after makeReady", async () => {});
    it("should be Issued after issuance approval", async () => {});
  });
  describe("bond reparation", () => {
    it("It should create a new bond, force some balances then force its issuance", async () => {});
  });
});
