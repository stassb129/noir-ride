import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private telegramService: TelegramService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = await this.contactRepository.save(
      this.contactRepository.create(createContactDto),
    );
    this.telegramService.notifyContactForm({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      message: contact.notes,
      source: contact.source,
    }).catch(() => null);
    return contact;
  }

  async findAll(): Promise<Contact[]> {
    return await this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Contact | null> {
    return await this.contactRepository.findOne({ where: { id } });
  }

  async updateStatus(id: number, status: string, notes?: string): Promise<Contact | null> {
    await this.contactRepository.update(id, { status, notes });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.contactRepository.delete(id);
  }
}
