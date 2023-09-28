import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployRegisterContractAccessManagementFixture } from './deployer/register.deployer';

chai.use(chaiAsPromised);

describe('Register - role management', function () {
  let fixture: any;
  this.beforeEach(async () => {
    fixture = await loadFixture(deployRegisterContractAccessManagementFixture);
  });

  this.afterEach(async () => {
    fixture = null;
  });

  it('CAK should be able to grant Cst role', async () => {
    const { instance, cakAddress, strangerAccount, cakRole } = fixture;
    const isCak = await instance
      .connect(strangerAccount)
      .hasRole(cakRole, cakAddress);

    expect(isCak).to.be.true;
  });
  it('deployer should have the DEFAULT_ADMIN_ROLE role', async () => {
    const { instance, cakAddress, strangerAccount, defaultAdminRole } = fixture;
    const isCak = await instance
      .connect(strangerAccount)
      .hasRole(defaultAdminRole, cakAddress);

    expect(isCak).to.be.true;
  });
  it('deployer should NOT have the BND role', async () => {
    const { instance, cakAddress, strangerAccount } = fixture;
    const isBnD = await instance.connect(strangerAccount).isBnD(cakAddress);
    expect(isBnD).to.be.false;
  });

  it('deployer should NOT have the Custodian role', async () => {
    const { instance, cakAddress, strangerAccount } = fixture;
    const isBnD = await instance.connect(strangerAccount).isBnD(cakAddress);
    expect(isBnD).to.be.false;
  });
  it('deployer should NOT have the paying agent role', async () => {
    const { instance, cakAddress, strangerAccount, payRole } = fixture;
    const ispayRole = await instance
      .connect(strangerAccount)
      .hasRole(payRole, cakAddress);
    expect(ispayRole).to.be.false;
  });
  it('deployer should NOT have the PAY role', async () => {
    const { instance, cakAddress, strangerAccount } = fixture;
    const isPayingAgent = await instance
      .connect(strangerAccount)
      .isPay(cakAddress);
    expect(isPayingAgent).to.be.false;
  });
  it('deployer should be able to manage the BND role', async () => {
    const { instance, strangerAccount, cakRole, bndRole } = fixture;
    const bndAdminRole = await instance
      .connect(strangerAccount)
      .getRoleAdmin(bndRole);
    expect(bndAdminRole).to.equal(
      cakRole,
      'CAK role should be the admin role for bnd role so that cak may grant a BND user'
    );
  });

  it('deployer should be able to manage the Custodian role', async () => {
    const { instance, strangerAccount, cakRole, custodianRole } = fixture;
    const custAdminRole = await instance
      .connect(strangerAccount)
      .getRoleAdmin(custodianRole);
    expect(custAdminRole).to.equal(cakRole);
  });
  it('CAK role (grant/revoke) can be set by CAK role - register contract deployer', async () => {
    const {
      instance,
      cakAddress,
      cakAccount,
      strangerAddress,
      strangerAccount,
      cakRole,
      defaultAdminRole,
      payRole,
      bndRole,
      custodianRole
    } = await loadFixture(deployRegisterContractAccessManagementFixture);
    const cakAdminRole = await instance
      .connect(strangerAccount)
      .getRoleAdmin(cakRole);
    const isDefaultAdmin = await instance
      .connect(strangerAccount)
      .hasRole(defaultAdminRole, cakAddress);
    expect(isDefaultAdmin).to.be.true;
  });

  it('CAK can grant another CAK', async () => {
    const { instance, cakAccount, strangerAccount, otherCakAddress, cakRole } =
      fixture;

    await instance.connect(cakAccount).grantRole(cakRole, otherCakAddress);
    const isAlsoCak = await instance
      .connect(strangerAccount)
      .hasRole(cakRole, otherCakAddress);
    expect(isAlsoCak).to.be.true;
  });

  it('Any CAK user may administrate the PayingAgent role (grant/revoke)', async () => {
    const {
      instance,
      cakAddress,
      strangerAccount,
      cakRole,
      defaultAdminRole,
      payRole
    } = fixture;

    //cak role admin is the defaultAdminRole (granted to the deployer of the register bond contract)
    const payAdminRole = await instance
      .connect(strangerAccount)
      .getRoleAdmin(payRole);
    const cakIsDefaultAdmin = await instance
      .connect(strangerAccount)
      .hasRole(defaultAdminRole, cakAddress);
    expect(cakIsDefaultAdmin).to.be.true;
    expect(payAdminRole).to.equal(
      cakRole,
      'payAdminRole should be the cakRole'
    );
    expect(payAdminRole).not.to.equal(
      defaultAdminRole,
      'payAdminRole should not be the default'
    );
  });

  it('deployer is the admin of default_admin role and can manage himself (inherited from AccessManagement)', async () => {
    const defaultAdminRoleAdmin = await fixture.instance
      .connect(fixture.strangerAccount)
      .getRoleAdmin(fixture.defaultAdminRole);
    expect(defaultAdminRoleAdmin).to.equal(fixture.defaultAdminRole);
  });
  it('stranger cannot grant cak role', async () => {
    const { instance, strangerAccount, strangerAddress } = fixture;
    await expect(
      instance.connect(strangerAccount).grantCakRole(strangerAddress)
    ).to.be.rejectedWith('Caller must be CAK or ADMIN');
  });

  it('stranger cannot grant custodian role', async () => {
    const { instance, strangerAccount, strangerAddress } = fixture;
    await expect(
      instance.connect(strangerAccount).grantCstRole(strangerAddress)
    ).to.be.rejectedWith('Caller must be CAK');
  });

  it('stranger cannot grant custodian role (inheristed from AccessControl)', async () => {
    const { instance, strangerAccount, strangerAddress, custodianRole } =
      fixture;
    //cak role is 0xa75205b8583660bdad375c0ccde11af17668d76a408a9a5e739251b0f7c59870
    await expect(
      instance
        .connect(strangerAccount)
        .grantRole(custodianRole, strangerAddress)
    ).to.be.rejectedWith('Caller must be CAK to set a role');
  });

  it('stranger cannot grant bnd role', async () => {
    const { instance, strangerAccount, strangerAddress, custodianRole } =
      fixture;
    await expect(
      instance.connect(strangerAccount).grantBndRole(strangerAddress)
    ).to.be.rejectedWith('Caller must be CAK');
  });

  it('stranger cannot grant bnd role  (inheristed from AccessControl)', async () => {
    const { instance, strangerAccount, strangerAddress, bndRole } = fixture;
    await expect(
      instance.connect(strangerAccount).grantRole(bndRole, strangerAddress)
    ).to.be.rejectedWith('Caller must be CAK to set a role');
  });

  it('stranger cannot grant pay role', async () => {
    const { instance, strangerAccount, strangerAddress, bndRole } = fixture;
    await expect(
      instance.connect(strangerAccount).grantPayRole(strangerAddress)
    ).to.be.rejectedWith('Caller must be CAK');
  });

  it('stranger cannot grant default_admin role', async () => {
    const { instance, strangerAccount, strangerAddress, defaultAdminRole } =
      fixture;
    await expect(
      instance
        .connect(strangerAccount)
        .grantRole(defaultAdminRole, strangerAddress)
    ).to.be.rejectedWith(
      'Use function changeAdminRole instead',
      'only default admin or CAK can manage the ADMIN_ROLE'
    );
  });

  it('should change the admin of the register', async () => {
    const {
      instance,
      strangerAccount,
      strangerAddress,
      defaultAdminRole,
      cakRole,
      cakAddress,
      cakAccount,
      otherCakAccount,
      otherCakAddress
    } = fixture;

    // GIVEN the admin being cak and otherCAK Address
    const isAlsoCak = await instance
      .connect(strangerAccount)
      .hasRole(cakRole, otherCakAddress);

    expect(isAlsoCak).to.be.false;

    if (!isAlsoCak) {
      await instance.connect(cakAccount).grantRole(cakRole, otherCakAddress);
    }
    // Given the address of the stranger to become cak

    // WHEN we follow the process of changing the admin
    await instance.connect(cakAccount).changeAdminRole(strangerAddress);
    await instance.connect(otherCakAccount).changeAdminRole(strangerAddress);

    // THEN the admin should be the stranger address
    const isAdmin = await instance
      .connect(strangerAccount)
      .hasRole(defaultAdminRole, strangerAddress);
    expect(isAdmin).to.be.true;
    // AND the initial admin should not be admin anymore
    const isStillAdmin = await await instance
      .connect(strangerAccount)
      .hasRole(defaultAdminRole, cakAddress);
    expect(isStillAdmin).to.be.false;
  });
});
