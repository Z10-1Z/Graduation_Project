<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DoctorMedicalRecordAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_doctor_can_list_and_download_patient_attachment(): void
    {
        Storage::fake('local');

        $doctor = User::factory()->doctor()->create();
        $patient = User::factory()->patient()->create();

        Appointment::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'appointment_date' => now()->toDateString(),
            'appointment_time' => '10:00',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($patient);
        $file = UploadedFile::fake()->create('scan.pdf', 100, 'application/pdf');
        $upload = $this->post('/api/medical-records/attachments', [
            'file' => $file,
            'category' => 'imaging',
        ])->assertCreated();

        $attachmentId = $upload->json('attachment.id');

        Sanctum::actingAs($doctor);

        $this->getJson("/api/doctor/patients/{$patient->id}")
            ->assertOk()
            ->assertJsonCount(1, 'attachments')
            ->assertJsonPath('attachments.0.category', 'imaging');

        $this->get("/api/doctor/medical-records/attachments/{$attachmentId}/download")
            ->assertOk();
    }

    public function test_doctor_cannot_download_unrelated_patient_attachment(): void
    {
        Storage::fake('local');

        $doctor = User::factory()->doctor()->create();
        $patientA = User::factory()->patient()->create();
        $patientB = User::factory()->patient()->create();

        Appointment::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patientA->id,
            'appointment_date' => now()->toDateString(),
            'appointment_time' => '10:00',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($patientB);
        $file = UploadedFile::fake()->create('x.pdf', 50, 'application/pdf');
        $attachmentId = $this->post('/api/medical-records/attachments', [
            'file' => $file,
            'category' => 'report',
        ])->assertCreated()->json('attachment.id');

        Sanctum::actingAs($doctor);

        $this->get("/api/doctor/medical-records/attachments/{$attachmentId}/download")
            ->assertNotFound();
    }
}
