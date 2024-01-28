import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import CaseType from 'App/Models/CaseType'

export default class CaseTypeSeeder extends BaseSeeder {
  public async run() {
    const types = [
      {
        name: 'General',
      },
      {
        name: 'Border security assessments',
      },
      {
        name: 'Child explotation',
      },
      {
        name: 'Civil case or investigation',
      },
      {
        name: 'Counter terrorism',
      },
      {
        name: 'Data exfiltration / IP theft',
      },
      {
        name: 'Drug offenses',
      },
      {
        name: 'Fraud',
      },
      {
        name: 'HR / Internal investigation',
      },
      {
        name: 'Human trafficking',
      },
      {
        name: 'Intrusion / incident response',
      },
      {
        name: 'Major crimes (murder, drug trafficking, weapons trafficking)',
      },
      {
        name: 'Military investigation',
      },
      {
        name: 'Organized crime',
      },
      {
        name: 'Policy violation / asset misuse',
      },
      {
        name: 'Probation / parole violation',
      },
      {
        name: 'SEC violation',
      },
      {
        name: 'Wrongful termination',
      },
    ]

    for (let type of types) {
      await CaseType.create(type)
    }
  }
}
