import Factory from '@ioc:Adonis/Lucid/Factory'
import Env from '@ioc:Adonis/Core/Env'
import cuid from 'cuid'
import AccessLog from 'App/Models/AccessLog'
import Acquisition from 'App/Models/Acquisition'
import AcquisitionException from 'App/Models/AcquisitionException'
import AcquisitionTask from 'App/Models/AcquisitionTask'
import AcquisitionRecord from 'App/Models/AcquisitionRecord'
import Address from 'App/Models/Address'
import Admin from 'App/Models/Admin'
import Case from 'App/Models/Case'
import CaseType from 'App/Models/CaseType'
import Company from 'App/Models/Company'
import Custodian from 'App/Models/Custodian'
import CustodianRequest from 'App/Models/CustodianRequest'
import Enterprise from 'App/Models/Enterprise'
import EnterpriseSubscriber from 'App/Models/EnterpriseSubscriber'
import Event from 'App/Models/Event'
import Evidence from 'App/Models/Evidence'
import EvidenceItem from 'App/Models/EvidenceItem'
import FileCategory from 'App/Models/FileCategory'
import FileType from 'App/Models/FileType'
import FileVariant from 'App/Models/FileVariant'
import HandlingError from 'App/Models/HandlingError'
import Notification from 'App/Models/Notification'
import NotificationSetting from 'App/Models/NotificationSetting'
import PasswordReset from 'App/Models/PasswordReset'
import Permission from 'App/Models/Permission'
import PersonalFolder from 'App/Models/PersonalFolder'
import PersonalFile from 'App/Models/PersonalFile'
import Preference from 'App/Models/Preference'
import PromoCode from 'App/Models/PromoCode'
import Role from 'App/Models/Role'
import Service from 'App/Models/Service'
import ServiceItem from 'App/Models/ServiceItem'
import ShareLink from 'App/Models/ShareLink'
import ShareResource from 'App/Models/ShareResource'
import State from 'App/Models/State'
import TimeZone from 'App/Models/TimeZone'
import TwoFactorToken from 'App/Models/TwoFactorToken'
import UberAccountInfo from 'App/Models/UberAccountInfo'
import UberTripHistory from 'App/Models/UberTripHistory'
import UberLocation from 'App/Models/UberLocation'
import UberPickup from 'App/Models/UberPickup'
import UberDestination from 'App/Models/UberDestination'
import UberDriver from 'App/Models/UberDriver'
import UberRider from 'App/Models/UberRider'
import UberStartCity from 'App/Models/UberStartCity'
import UberVehicle from 'App/Models/UberVehicle'
import UberWaypoint from 'App/Models/UberWaypoint'
import User from 'App/Models/User'
import UserInvitation from 'App/Models/UserInvitation'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import { DateTime } from 'luxon'
import chanceInstance from 'chance'
import { toNumber } from 'lodash'
import PasswordHasher from 'App/Auth/PasswordHasher'
import padLeft from 'pad-left'
import {
  PersonalFolderStatus,
  PersonalFileStatus,
  WorkGroupFolderStatus,
  WorkGroupFileStatus,
  ShareResourceType,
  ShareLinkType,
  AccountRole,
  AccessLogResource,
  AccessLogAction,
  PolicyAction,
  PolicyResource,
  PreferenceName,
  EventName,
  UserStatus,
  CaseStatus,
} from 'App/types'

const chance = chanceInstance.Chance()

export const AccessLogFactory = Factory.define(AccessLog, () => {
  const resource: AccessLogResource = 'case'
  const action: AccessLogAction = 'read'

  return {
    userId: chance.integer({ min: 1, max: 100 }),
    resourceId: chance.integer({ min: 1, max: 100 }),
    resource: resource,
    action: action,
    createdAt: DateTime.local(),
  }
})
  .state('custodian', (a) => (a.resource = 'custodian'))
  .state('evidence', (a) => (a.resource = 'evidence'))
  .state('write', (a) => (a.action = 'write'))
  .state('trash', (a) => (a.action = 'trash'))
  .state('grant', (a) => (a.action = 'grant'))
  .relation('user', () => UserFactory)
  .build()

export const AcquisitionFactory = Factory.define(Acquisition, () => {
  type StatusType = 'archived' | 'in_progress' | 'finished'
  let status: StatusType = 'in_progress'

  return {
    custodianId: chance.integer({ min: 1, max: 100 }),
    cloudAccountUsername: chance.string(),
    acquisitionType: 'custodian',
    accessToken: cuid(),
    status: status,
    requestedById: chance.integer({ min: 1, max: 100 }),
  }
})
  .state('in_progress', (custodianRequest) => (custodianRequest.status = 'in_progress'))
  .state('collected', (custodianRequest) => (custodianRequest.status = 'collected'))
  .state('archived', (custodianRequest) => (custodianRequest.status = 'archived'))
  .relation('requestedBy', () => UserFactory)
  .relation('custodian', () => CustodianFactory)
  .relation('evidence', () => EvidenceFactory)
  .relation('tasks', () => AcquisitionTaskFactory)
  .build()

export const AcquisitionExceptionFactory = Factory.define(AcquisitionException, () => {
  return {
    type: chance.company(),
    description: chance.paragraph(),
  }
})
  .relation('acquisition', () => AcquisitionFactory)
  .build()

export const AcquisitionTaskFactory = Factory.define(AcquisitionTask, () => {
  const status = 'pending'

  return {
    acquisitionId: chance.integer({ min: 1, max: 100 }),
    serviceItemId: chance.integer({ min: 1, max: 100 }),
    serviceName: chance.word(),
    description: chance.sentence(),
    status: status,
  }
})
  .relation('acquisition', () => AcquisitionFactory)
  .state('active', (acquisition) => (acquisition.status = 'active'))
  .state('failed', (acquisition) => (acquisition.status = 'failed'))
  .state('finished', (acquisition) => (acquisition.status = 'finished'))
  .relation('acquisition', () => AcquisitionFactory)
  .relation('serviceItem', () => ServiceItemFactory)
  .build()

export const AcquisitionRecordFactory = Factory.define(AcquisitionRecord, () => {
  return {
    recordId: chance.integer({ min: 1, max: 100 }),
    recordTable: chance.paragraph(),
    recordColumn: chance.paragraph(),
  }
})
  .relation('evidenceItem', () => EvidenceItemFactory)
  .build()

export const AddressFactory = Factory.define(Address, ({ faker }) => {
  return {
    addressableId: chance.integer({ min: 1, max: 100 }),
    addressableType: 'users',
    streetAddress: faker.address.streetAddress(),
    cityAddress: faker.address.city(),
    stateId: 1,
    homePhone: faker.phone.phoneNumber(),
    mobilePhone: faker.phone.phoneNumber(),
  }
})
  .relation('state', () => StateFactory)
  .build()

export const AdminFactory = Factory.define(Admin, async ({ faker }) => {
  const salt = cuid()
  const password = Env.get('TEST_PASSWORD')

  const hasher = new PasswordHasher(password, salt)
  const hashedPassword = await hasher.hash()

  return {
    email: faker.internet.email(),
    password: hashedPassword,
    salt: salt,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  }
}).build()

export const CaseFactory = Factory.define(Case, ({ faker }) => {
  const status: CaseStatus = 'active'
  const randomPublicId = chance.integer({ min: 1, max: 10000 })
  const publicCaseIdPart = padLeft(`${randomPublicId}`, 7, '0')

  return {
    companyId: chance.integer({ min: 1, max: 100 }),
    caseTypeId: 1,
    timeZoneId: 1,
    publicCaseId: `CID${publicCaseIdPart}`,
    createdById: chance.integer({ min: 1, max: 100 }),
    caseNumber: cuid.slug(),
    caseName: faker.lorem.word(),
    clientName: faker.name.firstName(),
    clientReference: faker.lorem.word(),
    clientPhone: faker.phone.phoneNumber(),
    clientEmail: faker.internet.email(),
    notes: faker.lorem.paragraph(4),
    status: status,
  }
})
  .relation('company', () => CompanyFactory)
  .relation('caseType', () => CaseTypeFactory)
  .relation('timeZone', () => TimeZoneFactory)
  .state('archived', (c) => (c.status = 'archived'))
  .build()

export const CaseTypeFactory = Factory.define(CaseType, () => {
  return {
    name: cuid.slug(),
  }
}).build()

export const CompanyFactory = Factory.define(Company, ({ faker }) => {
  return {
    userId: chance.integer({ min: 1, max: 100 }),
    name: faker.company.companyName(),
    isEnterprise: false,
    isEnterpriseSubscriber: false,
    billingStatus: 'unactivated',
    isTwoFactorRequired: false,
    maxEmployees: 3,
    channel: cuid(),
    deletedAt: null,
  }
})
  .state('active', (company) => (company.billingStatus = 'active'))
  .state('enterprise', (company) => (company.isEnterprise = true))
  .state('subscriber', (company) => (company.isEnterpriseSubscriber = true))
  .state('2fa_required', (company) => (company.isTwoFactorRequired = true))
  .state('deleted', (company) => (company.deletedAt = DateTime.local()))
  .relation('user', () => UserFactory)
  .relation('roles', () => RoleFactory)
  .relation('shareLinks', () => ShareLinkFactory)
  .build()

export const CustodianFactory = Factory.define(Custodian, ({ faker }) => {
  return {
    caseId: chance.integer({ min: 1, max: 100 }),
    email: faker.internet.email(),
    name: faker.name.firstName(),
  }
})
  .relation('case', () => CaseFactory)
  .relation('acquisitions', () => AcquisitionFactory)
  .build()

export const CustodianRequestFactory = Factory.define(CustodianRequest, () => {
  type Status = 'archived' | 'in_progress' | 'finished' | 'sent'
  const status: Status = 'sent'

  return {
    custodianId: chance.integer({ min: 1, max: 100 }),
    acquisitionId: chance.integer({ min: 1, max: 100 }),
    email: chance.email(),
    token: cuid(),
    status: status,
  }
})
  .state('in_progress', (custodianRequest) => (custodianRequest.status = 'in_progress'))
  .state('finished', (custodianRequest) => (custodianRequest.status = 'finished'))
  .state('archived', (custodianRequest) => (custodianRequest.status = 'archived'))
  .relation('custodian', () => CustodianFactory)
  .build()

export const EnterpriseFactory = Factory.define(Enterprise, () => {
  return {
    userId: chance.integer({ min: 1, max: 100 }),
    subdomain: cuid.slug(),
    database: cuid.slug(),
    billingStatus: 'unactivated',
  }
})
  .state('active', (enterprise) => (enterprise.billingStatus = 'active'))
  .relation('user', () => UserFactory)
  .relation('subscribers', () => EnterpriseSubscriberFactory)
  .build()

export const EnterpriseSubscriberFactory = Factory.define(EnterpriseSubscriber, () => {
  return {
    companyId: chance.integer({ min: 1, max: 100 }),
    enterpriseId: chance.integer({ min: 1, max: 100 }),
  }
})
  .relation('company', () => CompanyFactory)
  .relation('enterprise', () => EnterpriseFactory)
  .build()

export const EventFactory = Factory.define(Event, () => {
  const name: EventName = 'case-archived'
  const resource: PolicyResource | 'role' = 'case'

  return {
    userId: chance.integer({ min: 1, max: 100 }),
    companyId: chance.integer({ min: 1, max: 100 }),
    resource: resource,
    resourceId: null,
    name: name,
    data: { id: chance.integer({ min: 1, max: 100 }) },
  }
}).build()

export const EvidenceFactory = Factory.define(Evidence, () => {
  return {
    caseId: chance.integer({ min: 1, max: 100 }),
    custodianId: chance.integer({ min: 1, max: 100 }),
    serviceId: chance.integer({ min: 1, max: 100 }),
    publicEvidenceId: cuid(),
    status: null,
  }
})
  .relation('acquisition', () => AcquisitionFactory)
  .relation('service', () => ServiceFactory)
  .build()

export const EvidenceItemFactory = Factory.define(EvidenceItem, () => {
  const status: 'pending' | 'stored' = 'pending'

  return {
    evidenceId: chance.integer({ min: 1, max: 100 }),
    serviceItemId: chance.integer({ min: 1, max: 100 }),
    status: status,
    publicEvidenceItemId: cuid(),
    path: `${cuid()}/${cuid()}/${cuid()}`,
    size: chance.integer({ min: 1000, max: 10000 }),
    md5: cuid(),
    sha1: cuid(),
    date_collected: DateTime.local(),
  }
})
  .state('stored', (item) => (item.status = 'stored'))
  .relation('evidence', () => EvidenceFactory)
  .relation('serviceItem', () => ServiceItemFactory)
  .build()

export const FileCategoryFactory = Factory.define(FileCategory, ({ faker }) => {
  return {
    category: faker.random.alphaNumeric(10),
  }
})
  .relation('files', () => FileTypeFactory)
  .build()

export const FileTypeFactory = Factory.define(FileType, ({ faker }) => {
  return {
    fileCategoryId: chance.integer({ min: 1, max: 1000 }),
    name: faker.random.alphaNumeric(10),
    mime: 'text/plain',
  }
})
  .relation('category', () => FileCategoryFactory)
  .build()

export const FileVariantFactory = Factory.define(FileVariant, () => {
  return {
    fileTypeId: chance.integer({ min: 1, max: 1000 }),
    ext: 'docx',
  }
})
  .relation('file', () => FileTypeFactory)
  .build()

export const EventHandlingFactory = Factory.define(HandlingError, () => {
  const event: EventName = 'case-created'

  return {
    userId: chance.integer({ min: 1, max: 1000 }),
    companyId: chance.integer({ min: 1, max: 1000 }),
    event: event,
    data: { id: chance.integer() },
  }
}).build()

export const NotificationFactory = Factory.define(Notification, () => {
  const event: EventName = 'case-created'

  return {
    userId: chance.integer({ min: 1, max: 1000 }),
    companyId: chance.integer({ min: 1, max: 1000 }),
    eventId: chance.integer({ min: 1, max: 1000 }),
    event: event,
    message: chance.sentence({ words: 10 }),
    dismissedAt: null,
  }
})
  .relation('user', () => UserFactory)
  .relation('company', () => CompanyFactory)
  .build()

export const NotificationSettingFactory = Factory.define(NotificationSetting, () => {
  const event: EventName = 'user-added-to-company'

  return {
    userId: chance.integer({ min: 1, max: 1000 }),
    companyId: chance.integer({ min: 1, max: 1000 }),
    event: event,
    sendApp: true,
    sendEmail: false,
  }
})
  .state('sendEmail', (n) => (n.sendEmail = true))
  .build()

export const PasswordResetFactory = Factory.define(PasswordReset, () => {
  return {
    token: cuid(),
    used: false,
  }
})
  .state('used', (reset) => (reset.used = true))
  .state('expired', (reset) => (reset.createdAt = DateTime.local().minus({ minutes: 30 })))
  .relation('user', () => UserFactory)
  .build()

export const PermissionFactory = Factory.define(Permission, () => {
  const action: PolicyAction = 'read'
  const resource: PolicyResource = 'case'

  return {
    userId: chance.integer({ min: 1, max: 100 }),
    companyId: chance.integer({ min: 1, max: 100 }),
    resourceId: 1,
    action: action,
    resource: resource,
  }
})
  .state('read', (p) => (p.action = 'read'))
  .state('write', (p) => (p.action = 'write'))
  .state('trash', (p) => (p.action = 'trash'))
  .state('grant', (p) => (p.action = 'grant'))
  .state('custodian', (p) => (p.resource = 'custodian'))
  .state('evidence', (p) => (p.resource = 'evidence'))
  .relation('user', () => UserFactory)
  .relation('company', () => CompanyFactory)
  .build()

export const PersonalFolderFactory = Factory.define(PersonalFolder, ({ faker }) => {
  const access: 'private' | 'shared' = 'private'
  const status: PersonalFolderStatus = 'pending'

  return {
    userId: chance.integer({ min: 1, max: 1000 }),
    parentId: chance.integer({ min: 1, max: 1000 }),
    companyId: chance.integer({ min: 1, max: 1000 }),
    name: faker.random.word(),
    access: access,
    status: status,
    notes: faker.lorem.lines(2),
  }
})
  .state('shared', (folder) => (folder.access = 'shared'))
  .state('active', (folder) => (folder.status = 'active'))
  .state('updating', (folder) => (folder.status = 'updating'))
  .state('trashed', (folder) => (folder.status = 'trashed'))
  .relation('user', () => UserFactory)
  .relation('company', () => CompanyFactory)
  .relation('files', () => PersonalFileFactory)
  .build()

export const PersonalFileFactory = Factory.define(PersonalFile, ({ faker }) => {
  const access: 'private' | 'shared' = 'private'
  const status: PersonalFileStatus = 'pending'
  const bucket = Env.get('WASABI_WORKSPACE_BUCKET')
  return {
    personalFolderId: chance.integer({ min: 1, max: 1000 }),
    fileTypeId: chance.integer({ min: 1, max: 1000 }),
    name: faker.random.word(),
    path: `${bucket}/${cuid()}/${faker.random.word()}.pdf`,
    size: chance.integer({ min: 1000, max: 1e9 }),
    access: access,
    status: status,
    notes: faker.lorem.lines(2),
    dateCreated: DateTime.local(),
    lastModified: DateTime.local(),
    lastAccessed: DateTime.local(),
  }
})
  .state('shared', (folder) => (folder.access = 'shared'))
  .state('active', (folder) => (folder.status = 'active'))
  .state('updating', (folder) => (folder.status = 'updating'))
  .state('trashed', (folder) => (folder.status = 'trashed'))
  .relation('folder', () => PersonalFolderFactory)
  .relation('fileType', () => FileTypeFactory)
  .build()

export const PreferenceFactory = Factory.define(Preference, () => {
  const defaultPreference: PreferenceName = 'collapse-main-menu-bar'

  return {
    userId: chance.integer({ min: 1, max: 1000 }),
    companyId: chance.integer({ min: 1, max: 1000 }),
    name: defaultPreference,
    option: true,
  }
}).build()

export const PromoCodeFactory = Factory.define(PromoCode, () => {
  const date = DateTime.local().plus({ days: 1 })

  return {
    code: cuid(),
    expiresAt: date,
  }
}).build()

export const RoleFactory = Factory.define(Role, () => {
  const role: AccountRole = 'account-admin'

  return {
    userId: chance.integer({ min: 1, max: 1000 }),
    companyId: chance.integer({ min: 1, max: 1000 }),
    role: role,
    disabledAt: null,
  }
})
  .state('account-admin', (role) => (role.role = 'account-admin'))
  .state('case-manager', (role) => (role.role = 'case-manager'))
  .state('evidence-user', (role) => (role.role = 'evidence-user'))
  .state('client-user', (role) => (role.role = 'client-user'))
  .state('disabled', (role) => (role.disabledAt = DateTime.local()))
  .relation('user', () => UserFactory)
  .relation('company', () => CompanyFactory)
  .build()

export const ShareLinkFactory = Factory.define(ShareLink, async () => {
  const date = DateTime.local().plus({ days: 1 })

  const resource: ShareLinkType = 'work_group'
  const shareType: 'upload' | 'download' = 'download'

  const salt = cuid()
  const password = Env.get('TEST_PASSWORD')

  const hasher = new PasswordHasher(password, salt)
  const hashedPassword = await hasher.hash()

  return {
    companyId: chance.integer({ min: 1, max: 1000 }),
    grantedById: chance.integer({ min: 1, max: 1000 }),
    link: cuid(),
    email: chance.email(),
    salt: salt,
    password: hashedPassword,
    firstName: chance.first(),
    lastName: chance.last(),
    phone: chance.phone(),
    companyName: chance.company(),
    resource: resource,
    resourceId: chance.integer({ min: 1, max: 1000 }),
    folderId: chance.integer({ min: 1, max: 1000 }),
    shareType: shareType,
    subject: chance.sentence(),
    message: chance.paragraph(),
    canUpdatePassword: false,
    canTrash: false,
    visits: 0,
    expiresAt: date,
    deletedAt: null,
  }
})
  .state('update-password', (q) => (q.canUpdatePassword = true))
  .state('trash', (q) => (q.canTrash = true))
  .state('personal', (q) => (q.resource = 'personal'))
  .state('upload', (q) => (q.shareType = 'upload'))
  .relation('company', () => CompanyFactory)
  .relation('grantedBy', () => UserFactory)
  .relation('resources', () => ShareResourceFactory)
  .build()

export const ShareResourceFactory = Factory.define(ShareResource, () => {
  const resource: ShareResourceType = 'work_group_folders'

  return {
    shareLinkId: chance.integer({ min: 1, max: 1000 }),
    resource: resource,
    resourceId: chance.integer({ min: 1, max: 1000 }),
  }
})
  .relation('link', () => ShareLinkFactory)
  .build()

export const ServiceFactory = Factory.define(Service, ({ faker }) => {
  const serviceType: 'api' | 'upload' = 'api'

  return {
    name: faker.lorem.words(4),
    active: true,
    filterable: true,
    type: serviceType,
  }
})
  .state('upload', (service) => (service.type = 'upload'))
  .relation('items', () => ServiceItemFactory)
  .relation('evidences', () => EvidenceFactory)
  .build()

export const ServiceItemFactory = Factory.define(ServiceItem, ({ faker }) => {
  return {
    serviceId: chance.integer({ min: 1, max: 100 }),
    name: faker.lorem.words(2),
    description: faker.lorem.words(3),
    active: true,
  }
})
  .relation('service', () => ServiceFactory)
  .relation('evidenceItems', () => EvidenceItemFactory)
  .relation('tasks', () => AcquisitionTaskFactory)
  .build()

export const StateFactory = Factory.define(State, ({ faker }) => {
  return {
    code: faker.lorem.word(),
    name: faker.lorem.word(),
  }
}).build()

export const TimeZoneFactory = Factory.define(TimeZone, () => {
  return {
    local: cuid.slug(),
    utc: chance.integer({ min: 1, max: 10000 }),
  }
}).build()

export const TwoFactorTokenFactory = Factory.define(TwoFactorToken, () => {
  return {
    userId: chance.integer({ min: 1, max: 100 }),
    secret: cuid(),
    token: cuid.slug(),
    method: 'email',
  }
})
  .relation('user', () => UserFactory)
  .build()

export const UberAccountInfoFactory = Factory.define(UberAccountInfo, ({ faker }) => {
  return {
    acquisitionId: faker.random.number({ min: 1, max: 100 }),
    picture: faker.internet.url(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    uuid: faker.random.uuid(),
    email: faker.internet.email(),
    mobileVerified: faker.random.boolean(),
    promoCode: faker.lorem.paragraph(),
  }
})
  .relation('acquisition', () => AcquisitionFactory)
  .build()

export const UberTripHistoryFactory = Factory.define(UberTripHistory, ({ faker }) => {
  return {
    acquisitionId: faker.random.number({ min: 1, max: 100 }),
    historyStatus: faker.lorem.word(),
    distance: faker.random.float(1000),
    startTime: new Date().getTime() + 100,
    endTime: new Date().getTime() + 2000,
    requestTime: new Date().getTime() - 2000,
    productId: faker.random.alpha(),
    requestId: faker.random.alpha(),
    requestStatus: faker.random.word(),
    surgeMultiplier: faker.random.number(),
    shared: faker.random.boolean(),
  }
})
  .relation('acquisition', () => AcquisitionFactory)
  .relation('startCity', () => UberStartCity)
  .relation('driver', () => UberDriver)
  .relation('vehicle', () => UberVehicle)
  .relation('location', () => UberLocation)
  .relation('pickup', () => UberPickup)
  .relation('destination', () => UberDestination)
  .relation('waypoints', () => UberWaypoint)
  .relation('riders', () => UberRider)
  .build()

export const UberLocationFactory = Factory.define(UberLocation, ({ faker }) => {
  return {
    latitude: toNumber(faker.address.latitude()),
    longitude: toNumber(faker.address.longitude()),
    bearing: faker.random.number(),
  }
})
  .relation('history', () => UberTripHistory)
  .build()

export const UberPickupFactory = Factory.define(UberPickup, ({ faker }) => {
  return {
    alias: faker.random.words(),
    latitude: toNumber(faker.address.latitude()),
    longitude: toNumber(faker.address.longitude()),
    name: faker.random.alpha(),
    address: faker.address.streetAddress(),
    eta: faker.random.number(),
  }
})
  .relation('history', () => UberTripHistory)
  .build()

export const UberDestinationFactory = Factory.define(UberDestination, ({ faker }) => {
  return {
    alias: faker.random.words(),
    latitude: toNumber(faker.address.latitude()),
    longitude: toNumber(faker.address.longitude()),
    name: faker.random.alpha(),
    address: faker.address.streetAddress(),
    eta: faker.random.number(),
  }
})
  .relation('history', () => UberTripHistory)
  .build()

export const UberDriverFactory = Factory.define(UberDriver, ({ faker }) => {
  return {
    phoneNumber: faker.phone.phoneNumber(),
    smsNumber: faker.phone.phoneNumber(),
    rating: faker.random.number(5),
    pictureUrl: faker.internet.url(),
    name: faker.lorem.words(),
  }
})
  .relation('history', () => UberTripHistory)
  .build()

export const UberRiderFactory = Factory.define(UberRider, ({ faker }) => {
  return {
    riderId: faker.random.uuid(),
    firstName: faker.name.firstName(),
    me: faker.random.boolean(),
  }
})
  .relation('history', () => UberTripHistory)
  .build()

export const UberStartCityFactory = Factory.define(UberStartCity, ({ faker }) => {
  return {
    latitude: toNumber(faker.address.latitude()),
    displayName: faker.name.firstName(),
    longitude: toNumber(faker.address.longitude()),
  }
})
  .relation('history', () => UberTripHistory)
  .build()

export const UberVehicleFactory = Factory.define(UberVehicle, ({ faker }) => {
  return {
    make: faker.lorem.word(),
    model: faker.lorem.word(),
    licensePlate: faker.random.alpha(),
    pictureUrl: faker.internet.url(),
  }
})
  .relation('history', () => UberTripHistory)
  .build()

export const UberWaypointFactory = Factory.define(UberWaypoint, ({ faker }) => {
  return {
    riderId: faker.random.uuid(),
    latitude: toNumber(faker.address.latitude()),
    type: faker.random.alpha(),
    longitude: toNumber(faker.address.longitude()),
  }
})
  .relation('history', () => UberTripHistory)
  .build()

export const UserFactory = Factory.define(User, async ({ faker }) => {
  const status: UserStatus = 'active'

  const salt = cuid()
  const password = Env.get('TEST_PASSWORD')

  const hasher = new PasswordHasher(password, salt)
  const hashedPassword = await hasher.hash()

  return {
    email: faker.internet.email(),
    password: hashedPassword,
    salt: salt,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    status: status,
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    state: '1',
    zip: 12345,
    companyName: faker.company.companyName(),
    verified: true,
    verificationToken: cuid(),
    isTwoFactorRequired: false,
    channel: cuid(),
  }
})
  .state('invited', (user) => (user.status = 'invited'))
  .state('suspended', (user) => (user.status = 'suspended'))
  .state('deleted', (user) => (user.deletedAt = DateTime.local()))
  .state('unverified', (user) => (user.verified = false))
  .state('2fa_required', (user) => (user.isTwoFactorRequired = true))
  .relation('permissions', () => PermissionFactory)
  .relation('resets', () => PasswordResetFactory)
  .relation('roles', () => RoleFactory)
  .build()

export const UserInvitationFactory = Factory.define(UserInvitation, () => {
  type Status = 'sent' | 'opened' | 'accepted'
  const status: Status = 'sent'
  return {
    userId: 1,
    code: cuid(),
    status: status,
    expiresAt: DateTime.local().plus({ days: 1 }),
  }
})
  .state('opened', (invitation) => (invitation.status = 'opened'))
  .state('accepted', (invitation) => (invitation.status = 'accepted'))
  .relation('user', () => UserFactory)
  .build()

export const WorkGroupFolderFactory = Factory.define(WorkGroupFolder, ({ faker }) => {
  const access: 'private' | 'shared' = 'private'
  const status: WorkGroupFolderStatus = 'pending'

  return {
    caseId: chance.integer({ min: 1, max: 1000 }),
    parentId: chance.integer({ min: 1, max: 1000 }),
    ownerId: chance.integer({ min: 1, max: 1000 }),
    name: faker.random.word(),
    access: access,
    status: status,
    ownerName: faker.name.firstName(),
    notes: faker.lorem.lines(2),
  }
})
  .state('shared', (folder) => (folder.access = 'shared'))
  .state('active', (folder) => (folder.status = 'active'))
  .state('updating', (folder) => (folder.status = 'updating'))
  .state('trashed', (folder) => (folder.status = 'trashed'))
  .relation('case', () => CaseFactory)
  .relation('files', () => WorkGroupFileFactory)
  .relation('owner', () => UserFactory)
  .build()

export const WorkGroupFileFactory = Factory.define(WorkGroupFile, ({ faker }) => {
  const access: 'private' | 'shared' = 'private'
  const status: WorkGroupFileStatus = 'pending'
  const bucket = Env.get('WASABI_WORKSPACE_BUCKET')

  return {
    workGroupFolderId: chance.integer({ min: 1, max: 1000 }),
    fileTypeId: 1,
    ownerId: chance.integer({ min: 1, max: 1000 }),
    name: faker.random.word(),
    path: `${bucket}/${cuid()}/${faker.random.word()}.pdf`,
    size: chance.integer({ min: 1000, max: 1e9 }),
    access: access,
    status: status,
    ownerName: faker.name.firstName(),
    notes: faker.lorem.lines(2),
    dateCreated: DateTime.local(),
    lastModified: DateTime.local(),
    lastAccessed: DateTime.local(),
    lastAccessedById: chance.integer({ min: 1, max: 1000 }),
  }
})
  .state('shared', (folder) => (folder.access = 'shared'))
  .state('active', (folder) => (folder.status = 'active'))
  .state('updating', (folder) => (folder.status = 'updating'))
  .state('trashed', (folder) => (folder.status = 'trashed'))
  .relation('folder', () => WorkGroupFolderFactory)
  .relation('fileType', () => FileTypeFactory)
  .relation('owner', () => UserFactory)
  .relation('lastAccessedBy', () => UserFactory)
  .build()
